import MutationSummary from 'mutation-summary';
import Fingerprint2 from 'fingerprintjs2';
import DOMUtils from './contentscript/DOM-utils';
import showWizard, { showWizardAfterDomLoaded } from '../components/wizard'
import messageUtils from './message-utils';
// import { isPromiseResolved } from "promise-status-async";

let backgroundscriptReady = false;

let style = undefined;

const getFingerprint = () => {
  const calculateFingerprint = async () => {
    let components = await Fingerprint2.getPromise();
    var values = components.map(function (component) {
      return component.value;
    });
    var murmur = Fingerprint2.x64hash128(values.join(''), 31);
    console.log('fingerPRINT: ', murmur);

    return murmur;
  };

  return new Promise((resolve, reject) => {
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        resolve(calculateFingerprint());
      });
    } else {
      setTimeout(() => {
        resolve(calculateFingerprint());
      }, 500);
    }
  });
};

let backgroundPort = browser.runtime.connect({ name: "port-from-contentscript" });
backgroundPort.postMessageWithAck = messageUtils.postMessageWithAck;
messageUtils.addMessageHandlerWithAckAsPromise(backgroundPort, (message) => {
  // console.log('msg received:', message);
  switch (message.type) {
    case 'getFingerPrint':
      console.log('fingerprint requested from other extension script');
      // return Promise.resolve("got your request maddafaka");
      return getFingerprint();
    case 'stateUpdate':
      try {
        console.log('state update received');
        const state = message.payload;
        updateVisibilityAll(state);
        updateStyles(state);
        updateShareIcons(state);
        updateComposerAudience(state);
      } catch (err) {
        console.error(err);
        return 'stateUpdate failed somewhere in contentscript';
      }
      return 'performed your stateUpdate. Thaaaanx!!!';
    case 'redoIntro':
      return showWizardAfterDomLoaded();
    // case 'fetchLabelsRequest':
    //   console.log('fetchLabelsRequest received');
    //   return state;
    default:
      console.log('unknown message type', message);
      return 'unknown message type';
  }
});

const sendUserInteraction = (payload) => {
  backgroundPort.postMessage({ type: 'userInteraction', payload: payload });
};

const sendStateUpdate = (state) => {
  console.log('sending state to bg: ', state);
  backgroundPort.postMessage({ type: 'stateUpdate', payload: state });
};

const sendStateRequest = () => backgroundPort.postMessageWithAck({ type: 'stateRequest', payload: null })

console.log('Sending contentScriptReady to bgscript');

backgroundPort.postMessageWithAck({ type: 'contentscriptReady', payload: null })
  .then((response) => {
    console.log('contentScriptReady response from bgscript: ', response);
    backgroundscriptReady = true;
    sendUserInteraction({ eventType: 'refresh' });
  })

//INIT stuff is happening here
const init = async () => {
  console.log('init');
  const state = await backgroundPort.postMessageWithAck({ type: 'refreshState' });
  const wizardCompleted = await backgroundPort.postMessageWithAck({ type: 'wizardCompleted' });

  if (!wizardCompleted) {
    showWizard()
  }
  console.log('response received: ', state);
  // state = response;
  let selectors = state.facebookCssSelectors;

  if (!state.thingsToHide) {
    console.error('thingsToHide is null or undefined');
    return;
  } else {
    console.log('state is: ', state);
  }

  // updateStyles();
  updateShareIcons(state);

  updateVisibilityAll();

  let watchedNodesQuery = [];

  // Warning. Non obvious use of reduce function (as is always the case when using reduce...)
  // We simply merge the hide/show cssSelectors to a string with comma separation (css selector list)
  // TODO: MAKE THIS WORK WITH THE NEW STRUCTURE OF STATESCHEMA!!!
  // let hideSelectorListString = state.thingsToHide.reduce(
  //   (accuString, currentSelector, idx) => {
  //     // console.log(accuString);
  //     return idx == 0
  //       ? currentSelector.cssSelector
  //       : accuString + ", " + currentSelector.cssSelector;
  //   },
  //   ""
  // );
  // watchedNodesQuery.push({ element: hideSelectorListString });
  let initialNodeObserver = new MutationSummary({
    callback: () => {
      console.log('FETCH LABELS AND UPDATE STATE', state);
      sendStateUpdate(fetchLabelsAndAddToState(state));
      initialNodeObserver.disconnect();
    },
    queries: [{ element: selectors.composerToolbar.selector }],
  });

  // watchedNodesQuery.push({
  //   element: selectors.composer,
  // });

  // watchedNodesQuery.push({
  //   element: 'table.uiGrid',
  // });

  // watchedNodesQuery.push({
  //   element: selectors.composerToolbar,
  // });

  watchedNodesQuery.push({
    element: '[data-testid=\"Keycommand_wrapper_ModalLayer\"]',
  });

  // we want to react as soon the head tag is inserted into the DOM.
  // Unfortunately it doesn't seem possible to observe the head tag.
  // So let's instead observe the body tag. It should presumably load directly after the head tag.
  watchedNodesQuery.push({ element: 'body' });

  console.log('watchedNodes: ', watchedNodesQuery);
  let nodeObserver = new MutationSummary({
    callback: nodeChangeHandler,
    queries: watchedNodesQuery,
  });
};

const nodeChangeHandler = async (summaries) => {
  console.log("node summary was triggered");
  console.log(summaries);

  const state = await sendStateRequest();

  let selectors = state.facebookCssSelectors;

  //Super ugly hack to make sure we hide/show on page refresh!!!
  updateVisibilityAll(state);

  for (let summary of summaries) {
    let changedNodes =
      summary.reparented && summary.reparented.length != 0
        ? summary.reparented
        : summary.added;
    for (let node of changedNodes) {
      if (node.matches('body')) {
        onBodyTagLoaded();
      }
      console.log(node)
      for (let item of state.thingsToHide) {
        if (node.matches(item.cssSelector)) {
          if (item.hide) {
            hideElement(node);
          } else {
            showElement(node);
          }
        }
      }

      if (node.matches(selectors.postContainerClass)) {
        updateShareIcons(state);
      }

      if (node.matches(selectors.composerFeedAudienceSelector)) {
        updateComposerAudience(state);
      }
    }
    if (summary.valueChanged && summary.valueChanged.length) {
      updateComposerAudience(state);
    }
  }
};

const updateVisibilityAll = (state) => {
  // console.log("updateVisibilityAll called");
  if (!state.thingsToHide) {
    console.error('thingsToHide is null or undefined');
    return;
  }
  try {
    for (let category of state.thingsToHide) {
      if (category.groups) {
        for (let group of category.groups) {
          if (group.option) {
            DOMUtils.updateVisibilityFromShowHideObject(state, group.option);
          }
          if (group.options) {
            for (let option of group.options) {
              DOMUtils.updateVisibilityFromShowHideObject(state, option);
            }
          }
        }
      }
      if (category.options) {
        for (let option of category.options) {
          DOMUtils.updateVisibilityFromShowHideObject(state, option);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// goes through the stateObject tree and runs aFunction on all option objects in the tree
const applyToAllOptionObjectsInState = (aFunction, stateObject) => {
  const recursion = (aFunction, subStateObject) => {
    // console.log("entering recursion with (sub)state: ", subStateObject);
    for (let [key, value] of Object.entries(subStateObject)) {
      if (key == 'option') {
        // console.log("one option found:", value);
        aFunction(value);
        continue;
      }
      if (key == 'options') {
        // console.log("option array found:", value);
        for (let el of value) {
          aFunction(el);
        }
        continue;
      }
      if (Array.isArray(value)) {
        // console.log("subArray found:", value);
        for (let el of value) {
          if (typeof el === 'object' && el !== null) {
            recursion(aFunction, el);
          }
        }
        continue;
      }
      if (typeof value === 'object' && value !== null) {
        recursion(aFunction, value);
        // console.log("subObject found: ", value);
        // for (let [key, subValue] of Object.entries(value)) {

        // }
        continue;
      }
    }
  };

  recursion(aFunction, stateObject);
};

const fetchLabelsAndAddToState = (state) => {
  console.log('FETCHING ALL OPTION OBJECTS IN STATE!!!');

  function addLabel(optionObj) {
    if (optionObj.labelCssSelectorName) {
      let selectorNameArray = optionObj.cssSelectorName.split(':');
      let selectorName = selectorNameArray[0];
      let selectorParameter = null;
      if (selectorNameArray[1]) {
        selectorParameter = selectorNameArray[1];
        console.log('selectorParameter ', selectorParameter);
      }
      let cssSelectorObject = state.facebookCssSelectors[selectorName];
      console.log('retrieved cssSelectorObject: ', cssSelectorObject);

      let node = DOMUtils.getNodeFromCssObject(
        state,
        document,
        cssSelectorObject,
        selectorParameter
      );
      if (!node) {
        console.error("didn't find the startElement before fetching label");
        return;
      }

      console.log(
        'Extracting option label from DOM using',
        optionObj.labelCssSelectorName
      );
      let labelCssSelectorObject =
        state.facebookCssSelectors[optionObj.labelCssSelectorName];
      let label = DOMUtils.getNodeFromCssObject(
        state,
        node,
        labelCssSelectorObject,
        null
      );
      if (!label) {
        console.error("didn't find the labelElement");
        return;
      }
      optionObj.name = label;
      console.log('SET LABEL: ', label);
    }
  }
  // console.log("state before label fetch: ", state);
  applyToAllOptionObjectsInState(addLabel, state);
  // console.log("state after label fetch: ", state);
  return state;
};

const updateStyles = (state) => {
  for (let customCssItem of state.customCss) {
    DOMUtils.applyCustomCssObject(state, customCssItem);
  }
};

const updateComposerAudience = (state) => {
  // console.log("updateComposerAudience Called");
  let selectors = state.facebookCssSelectors;
  let composer = document.querySelector(selectors.composer);
  let composerFooter = DOMUtils.getNodeFromCssObject(state, composer, selectors['composerFooter'], null);
  if (!composerFooter) return
  // console.log("composer: ", composer);
  let checkBoxes = composerFooter.querySelectorAll('[role=checkbox]');
  // console.log("checkBoxes: ", checkBoxes);
  if (checkBoxes && checkBoxes.length) {
    for (let checkBox of checkBoxes) {
      let selectAudienceButton = checkBox.nextElementSibling.firstElementChild;
      if (!selectAudienceButton) {
        console.error(
          'no audience selector element found. Was the css selector perhaps changed by facebook?'
        );
        return;
      }

      if (
        checkBox.getAttribute('aria-checked') == 'true' &&
        state.audienceSettings.highlightAudienceWhenPosting
      ) {
        selectAudienceButton.classList.add('red-highlight-border');
      } else {
        selectAudienceButton.classList.remove('red-highlight-border');
      }
    }
  } else {
    let selectAudienceButtons = composerFooter.querySelectorAll(
      '[role=button]'
    );
    // console.log(selectAudienceButtons);
    for (let selectAudienceButton of selectAudienceButtons) {
      let buttonContainer =
        selectAudienceButton.parentElement.parentElement.parentElement;
      if (state.audienceSettings.highlightAudienceWhenPosting) {
        buttonContainer.classList.add('red-highlight-border');
      } else {
        buttonContainer.classList.remove('red-highlight-border');
      }
    }
  }
};

const updateShareIcons = (state) => {
  let selectors = state.facebookCssSelectors;

  let postContentWrappers = document.querySelectorAll(
    selectors.postContainerClass
  );
  if (!postContentWrappers) {
    console.error(
      'no postContentWrapper found! Have FB perhaps renamed the cssSelectors?'
    );
    return;
  }
  // console.log("found postContentWrappers:", postContentWrappers);

  if (state.audienceSettings.replaceAudienceIconsWithText) {
    for (let postWrapper of postContentWrappers) {
      setDisplayForShareIconAndShareText(state, postWrapper, false, true);
    }
  } else {
    for (let postWrapper of postContentWrappers) {
      setDisplayForShareIconAndShareText(state, postWrapper, true, false);
    }
  }
};

const setDisplayForShareIconAndShareText = (
  state,
  postContainer,
  showShareIcon,
  showShareText
) => {
  let selectors = state.facebookCssSelectors;

  // First let's handle the icon!
  let iconNode = postContainer.querySelector(selectors.shareIconAttributes);
  if (!iconNode) {
    console.error(
      'no icon element found. Have facebook changed the css selectors?'
    );
    return;
  }
  let dot = iconNode.previousElementSibling;
  if (!dot) {
    console.error(
      'no dot element found. Have facebook changed the css selectors?'
    );
    return;
  }
  if (showShareIcon) {
    DOMUtils.showElement(iconNode);
    DOMUtils.showElement(dot);
  } else {
    DOMUtils.hideElement(iconNode);
    DOMUtils.hideElement(dot);
  }

  //Secondly we handle the sharetext
  let sharingTextClass = 'sharing-text';
  let textNode = postContainer.querySelector('.' + sharingTextClass);
  if (!textNode) {
    // console.log("no textNode present. Creating one!!!");
    // extract the accesibility text from wrapping elements
    let altText = '';
    altText = iconNode.getAttribute('data-tooltip-content');

    // console.log("retrieved alt text: ", altText);
    textNode = document.createElement('h2');
    textNode.classList.add(sharingTextClass);
    textNode.textContent = altText;
    postContainer.querySelector('.clearfix').appendChild(textNode);
  }

  if (showShareText) {
    DOMUtils.showElement(textNode);
  } else {
    DOMUtils.hideElement(textNode);
  }
};

const onBodyTagLoaded = async () => {
  DOMUtils.createStyleTag();
  console.log('body tag added to DOM');
};

// document.addEventListener("DOMContentLoaded", () =>
//   console.log("DOCUMENT LOADED")
// );

console.log('YOO! FB4Seniles loaded!!!');
init();
