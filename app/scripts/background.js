// import Parse from 'parse';
// import stateSchema from './stateSchema.js';
import state from './background/state';
import parseUtil from './background/parse-util';
import messageUtils from './message-utils';
import wizard from './background/wizard';
import browserActions from './background/browserActions';

import { getDiff } from 'recursive-diff';

let initState = {};

let contentPort, menuPort;

//we create a promise here that will settle when the fingerprint (hopefully) is received
// let fingerPrintReceived = new Promise();
let resolveContentscriptReady;
let contentscriptReady = new Promise((resolve) => {
  resolveContentscriptReady = resolve;
});

//Perhaps a bit bloaty... Could just call sendMessageToPage directly...
const getFingerprintFromContentScript = async () => {
  let response = await sendMessageToPage('getFingerPrint', null).catch(
    (err) => {
      console.error('no browserPrint was recevied: ', err);
      return Promise.reject(err);
    }
  );
  console.log('got browserPrint from page: ', response);
  return response;
};

//WHAT IS THE SETUP FUNCTION DOING:
//Check if there is state in local storage.
//If there was a state in local storage. Check that it has the correct object schema (same as the one in sources).
//If not, throw it away and use the state from source code.
//If no state found in local storage, fall back to using initial state from source code.
//Fetch json with facebook selectors from file on github
//Put the fetched json data into our state object.
//Save the state object to local storage.

const refreshState = async () => {
  let facebookCssSelectors = await retrieveFacebookCssSelectors();
  console.log('facebookCssSelectors: ', facebookCssSelectors);
  await state.initialize(facebookCssSelectors);

  return state.get()
}

const setup = async () => {
  console.log('ENV: ', process.env.NODE_ENV);
  const _state = refreshState();
  console.log('state initialized: ', _state);

  browserActions.setBrowserActionToPopup();
  await contentscriptReady;

  const analyticsActivated = localStorage.getItem('analyticsActivated') === 'true';
  if (analyticsActivated) {
    getBrowserFingerPrintAndSetupParse();
  }
};

const getBrowserFingerPrintAndSetupParse = async (contact) => {
  let browserPrint = localStorage.getItem('browserFingerPrint');
  if (!browserPrint) {
    console.log('no browserprint saved in storage. Gonna ask the page for one');
    browserPrint = await getFingerprintFromContentScript();
    if (browserPrint) {
      localStorage.setItem('browserFingerPrint', browserPrint);
      parseUtil.setupParseConnection(browserPrint, contact);
    }
  } else {
    parseUtil.setupParseConnection(browserPrint, contact);
  }
}

const sendMessageToPage = async (type, msg) => {
  console.log('skickar till page:', type, msg);
  try {
    let response = await contentPort.postMessageWithAck({
      type: type,
      payload: msg,
    });
    console.log('sent message resolved: ', response);
    return response;
  } catch (err) {
    console.error("Probably didn't find any active tab to send to");
    console.error(err);
  }
};

const messageFromContentHandler = (message) => {
  console.log('message from contentscript received: ', message);
  switch (message.type) {
    case 'stateRequest':
      return state.get();
    case 'refreshState':
      return refreshState();
    case 'stateUpdate':
      // let parsedStateObject = JSON.parse(message.payload);
      console.log('received state update from page', message.payload);
      state.set(message.payload);
      sendMessageToPage('stateUpdate', state.get());
      return 'Aiight! Got your state!';
    case 'initStateRequest':
      console.log('got initStateRequest from popup');
      return initState;
    case 'contentscriptReady':
      console.log('got contentscriptReady msg!');
      resolveContentscriptReady();
      return "You're ready. I, the bgscript, hereby acknowledge that!!";
    case 'userInteraction':
      return parseUtil.sendUserInteraction(message.payload, state.get());
    case 'wizardCompleted':
      return wizard.isCompleted()
    case 'setWizardCompleted':
      const activateAnalytics = wizard.setCompleted(message.payload);
      if (activateAnalytics) {
        getBrowserFingerPrintAndSetupParse(message.payload.contact);
      }
      sendMessageToPage('stateUpdate', state.get());
      return;
    default:
      console.log('unknown message type');
      return 'unknown message type';
  }
}

const messageFromMenuHandler = message => {
  console.log('message from menu received: ', message);
  switch (message.type) {
    case 'toggleState':
      state.toggleEnabled();
      sendMessageToPage('stateUpdate', state.get());
      return;
    case 'stateRequest':
      let gotState = state.get();
      if (gotState) {
        console.log('stateRequest', gotState);
        return gotState;
      } else {
        return Promise.reject("couldn't retrieve a state from localStorage!");
      }
    case 'stateEnabledRequest':
      let enabled = state.getEnabled();
      if (enabled !== undefined) {
        console.log('stateEnabledRequest', enabled);
        return enabled;
      } else {
        return Promise.reject(
          "couldn't retrieve a stateEnabled from localStorage!"
        );
      }
    case 'stateUpdate':
      console.log('received state update from menu', message.payload);
      state.set(message.payload);
      parseUtil.updateUserSettings(state.get());
      sendMessageToPage('stateUpdate', state.get());
      return 'Aiight! Got your state!';
    case 'redoIntro':
      console.log('redo intro');
      state.reset();
      localStorage.setItem('wizardCompleted', false);
      sendMessageToPage('redoIntro');
      return;
  }
}

browser.runtime.onConnect.addListener((port) => {
  console.log('port connected: ', port);
  port.onDisconnect.addListener((p) => {
    console.log('port disconnected:', p.name);
  })
  if (port.name === 'port-from-contentscript') {
    contentPort = port;
    messageUtils.addMessageHandlerWithAckAsPromise(contentPort, messageFromContentHandler);
    contentPort.postMessageWithAck = messageUtils.postMessageWithAck;
  } else if (port.name === 'port-from-menu') {
    menuPort = port;
    messageUtils.addMessageHandlerWithAckAsPromise(menuPort, messageFromMenuHandler);
    menuPort.postMessageWithAck = messageUtils.postMessageWithAck;
    let priorState = state.get();

    menuPort.onDisconnect.addListener((p) => {
      // console.log('popup closed');
      let changedSettingsArray = getDiff(priorState, state.get());
      // console.log('changedSettings: ', changedSettingsArray);
      if (changedSettingsArray.length) {
        let changesObject = {}
        for (let elem of changedSettingsArray) {
          let tempDepthref = changesObject;
          for (let [i, key] of elem.path.entries()) {
            if (i >= elem.path.length - 1) {
              tempDepthref[key] = elem.val;
              break;
            }
            else if (!tempDepthref[key]) {
              let thing = typeof key == 'number' ? [] : {};
              tempDepthref[key] = thing;
            }
            tempDepthref = tempDepthref[key];
          }
        }
        // console.log(changesObject);

        let payload = { eventType: 'settingsChange', eventData: { changes: changesObject } }
        parseUtil.sendUserInteraction(payload, state.get());
      }
    })

  }
})

const retrieveFacebookCssSelectors = async () => {
  // We ain't wanna have to push the json to github for each edit. So during development we simply require it.
  if (process.env.NODE_ENV === 'development') {
    let importedJson = require('../../facebookCssSelectors.json');
    console.log('facebookCssSelectors: ', importedJson);
    return importedJson;
  } else {
    let githubRawUrl = 'https://raw.githubusercontent.com/';
    let facebookCssSelectorsJsonPath =
      'hci-gu/facebook-for-digital-seniors/master/facebookCssSelectors.json';

    let response = await fetch(githubRawUrl + facebookCssSelectorsJsonPath);
    console.log('fetched json from github');

    return response.json();
  }
};

//Now GOOOO!
setup();
