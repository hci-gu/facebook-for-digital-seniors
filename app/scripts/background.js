// import Parse from 'parse';
// import stateSchema from './stateSchema.js';
import state from './background/state';
import parseUtil from './background/parse-util';
import messageUtils from './message-utils';
import wizard from './background/wizard';

let initState = {};

let contentPort, menuPort;

// browser.runtime.onInstalled.addListener(details => {
//   console.log("previousVersion", details.previousVersion);
// });

// browser.browserAction.setBadgeText({
//   text: `BFB`
// });

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

  setBrowserActionToPopup();
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

function match(pattern, url) {
  pattern = pattern.split('/');
  url = url.split('/');

  while (url.length) {
    const p = pattern.shift();
    if (p !== url.shift() && p !== '*') return false;
  }
  return true;
}

browser.tabs.onActivated.addListener(async (activeInfo) => {
  console.log(activeInfo);
  let activatedTab = await browser.tabs.get(activeInfo.tabId);
  console.log('activatedTab', activatedTab);
  if (
    match('https://www.facebook.com/*', activatedTab.url) ||
    match('http://www.facebook.com/*', activatedTab.url)
  ) {
    console.log('activated tab matched');
    setBrowserActionToPopup();
  } else {
    setBrowserActionToChangeTab();
    console.log("activated tab didn't match");
  }
});

const setBrowserActionToPopup = () => {
  console.log('setting browser action to popup');
  browser.browserAction.setPopup({ popup: 'pages/menu.html' });
};

const setBrowserActionToChangeTab = () => {
  console.log('setting browser action to change tab');
  browser.browserAction.setPopup({ popup: '' });
};

browser.browserAction.onClicked.addListener(async () => {
  let tabs = await browser.tabs.query({
    currentWindow: true,
    url: ['*://www.facebook.com/*', '*://www.facebook.se/*'],
  });

  console.log(tabs);

  if (tabs.length) {
    console.log('gonna highlight a tab!');
    browser.tabs.highlight({
      tabs: [tabs[0].index],
    });
  } else {
    console.log('creating a tab!');
    browser.tabs.create({
      url: 'https://www.facebook.com',
      active: true,
    });
  }
});

const sendMessageToPopup = async (type, msg) => {
  // return browser.runtime.sendMessage({ type: type, payload: msg });
  try {
    let response = await menuPort.postMessageWithAck({
      type: type,
      payload: msg,
    });
    console.log('sent message resolved: ', response);
    return response;
  } catch (err) {
    console.error("Couldn't send message to menu. Probably the menu is currently not open");
    console.error(err);
  }
};

const sendMessageToPage = async (type, msg) => {
  console.log('skickar till page:', type, msg);
  // return browser.tabs
  //   .query({ currentWindow: true, active: true })
  //   .then((tabs) => {
  //     console.log(tabs);
  //     return browser.tabs
  //       .sendMessage(tabs[0].id, {
  //         type: type,
  //         payload: msg,
  //       })
  //       .then((answer) => {
  //         console.log('sent message resolved: ', answer);
  //         return answer;
  //       })
  //       .catch((err) => {
  //         console.error('sendMessage threw error:');
  //         console.error(err);
  //       });
  //   })
  //   .catch((err) => {
  //     console.error("Probably didn't find any active tab to send to");
  //     console.error(err);
  //   });
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
      // sendMessageToPopup("stateUpdate", message)
      //   .then(response => {
      //     console.log("response from sending state to popup: ", response);
      //   })
      //   .catch(err => {
      //     console.error(err);
      //     console.error("the popup is probably not open");
      //   });
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
      return localStorage.getItem('wizardCompleted') === 'true';
    case 'setWizardCompleted':
      wizard.setCompleted();
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
  if (port.name === 'port-from-contentscript') {
    contentPort = port;
    messageUtils.addMessageHandlerWithAckAsPromise(contentPort, messageFromContentHandler);
    contentPort.postMessageWithAck = messageUtils.postMessageWithAck;
  } else if (port.name === 'port-from-menu') {
    menuPort = port;
    messageUtils.addMessageHandlerWithAckAsPromise(menuPort, messageFromMenuHandler);
    menuPort.postMessageWithAck = messageUtils.postMessageWithAck;
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
      'Dealerpriest/facebook-for-elderly/master/facebookCssSelectors.json';

    let response = await fetch(githubRawUrl + facebookCssSelectorsJsonPath);
    console.log('fetched json from github');

    return response.json();
  }
};

//Now GOOOO!
setup();
