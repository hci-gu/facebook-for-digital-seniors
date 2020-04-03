import MutationSummary from 'mutation-summary';
import Fingerprint2 from 'fingerprintjs2';
// import { isPromiseResolved } from "promise-status-async";

let state = {};

let resolveStateLoaded;
let stateLoadedPromise = new Promise((resolve, reject) => {
  resolveStateLoaded = resolve;
});

let backgroundscriptReady = false;

let style = undefined;

const getFingerprint = () => {
  const calculateFingerprint = async () => {
    let components = await Fingerprint2.getPromise();
    var values = components.map(function(component) {
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

browser.runtime.onMessage.addListener(async message => {
  console.log('msg received:', message);
  switch (message.type) {
    case 'getFingerPrint':
      console.log('fingerprint requested from other extension script');
      // return Promise.resolve("got your request maddafaka");
      return getFingerprint();
    case 'stateUpdate':
      try {
        console.log('state update received');
        state = message.payload;
        updateVisibilityAll();
        updateStyles();
        updateShareIcons();
        updateComposerAudience();
      } catch (err) {
        console.error(err);
        return 'stateUpdate failed somewhere in contentscript';
      }
      return 'performed your stateUpdate. Thaaaanx!!!';
    case 'fetchLabelsRequest':
      console.log('fetchLabelsRequest received');
      fetchLabelsAndAddToState();
      return state;
    default:
      console.log('unknown message type', message.type);
      return Promise.resolve('unknown message type');
  }
});

window.addEventListener('click', evt => {
  // console.log(evt);
  // console.log(evt.detail);
  if (evt.detail == 1) {
    sendUserInteraction({
      eventType: 'click',
      eventData: { x: evt.x, y: evt.y }
    });
  }
});

const sendUserInteraction = payload => {
  browser.runtime
    .sendMessage({ type: 'userInteraction', payload: payload })
    .then(response => {
      console.log('sendUserInteraction response: ', response);
    });
};

const sendStateUpdate = state => {
  browser.runtime
    .sendMessage({ type: 'stateUpdate', payload: state })
    .then(response => {
      console.log('sendStateUpdate response: ', response);
    });
};

console.log('Sending contentScriptReady to bgscript');
browser.runtime
  .sendMessage({ type: 'contentscriptReady', payload: null })
  .then(response => {
    console.log('contentScriptReady response from bgscript: ', response);
    backgroundscriptReady = true;
    sendUserInteraction({ eventType: 'refresh' });
  });

//INIT stuff is happening here
browser.runtime
  .sendMessage({ type: 'stateRequest', payload: null })
  .then(response => {
    console.log('response received: ', response);
    state = response;
    resolveStateLoaded();
    let selectors = state.facebookCssSelectors;

    if (!state.thingsToHide) {
      console.error('thingsToHide is null or undefined');
      return;
    } else {
      console.log('state is: ', state);
    }

    // updateStyles();
    updateShareIcons();

    // updateVisibilityAll();

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

    watchedNodesQuery.push({
      element: selectors.postContainerClass
    });

    watchedNodesQuery.push({
      element: selectors.composerFeedAudienceSelector
    });

    // To trigger when interact with checkboxes!
    watchedNodesQuery.push({
      attribute: 'aria-checked'
    });

    // we want to react as soon the head tag is inserted into the DOM.
    // Unfortunately it doesn't seem possible to observe the head tag.
    // So let's instead observe the body tag. It should presumably load directly after the head tag.
    watchedNodesQuery.push({ element: 'body' });

    console.log('watchedNodes: ', watchedNodesQuery);
    let nodeObserver = new MutationSummary({
      callback: nodeChangeHandler,
      queries: watchedNodesQuery
    });
  });

const nodeChangeHandler = summaries => {
  // console.log("node summary was triggered");
  // console.log(summaries);

  let selectors = state.facebookCssSelectors;

  //Super ugly hack to make sure we hide/show on page refresh!!!
  updateVisibilityAll();

  for (let summary of summaries) {
    let changedNodes =
      summary.reparented && summary.reparented.length != 0
        ? summary.reparented
        : summary.added;
    for (let node of changedNodes) {
      //was it the head tag?
      if (node.matches('body')) {
        onBodyTagLoaded();
      }
      // for (let item of state.thingsToHide) {
      //   if (node.matches(item.cssSelector)) {
      //     if (item.hide) {
      //       hideElement(node);
      //     } else {
      //       showElement(node);
      //     }
      //   }
      // }

      if (node.matches(selectors.postContainerClass)) {
        updateShareIcons();
      }

      if (node.matches(selectors.composerFeedAudienceSelector)) {
        updateComposerAudience();
      }
    }
    if (summary.valueChanged && summary.valueChanged.length) {
      updateComposerAudience();
    }
  }
};

const getNodeFromCssObject = (
  startNode,
  cssSelectorObject,
  selectorParameter
) => {
  console.log(
    'getNodeFromCssObject:',
    startNode,
    cssSelectorObject,
    selectorParameter
  );
  let node = null;
  if (typeof cssSelectorObject === 'object' && cssSelectorObject !== null) {
    // console.log("retrieving node from traversal string", cssSelectorObject);
    if (cssSelectorObject.selectorName) {
      startNode = getNodeFromCssObject(
        startNode,
        state.facebookCssSelectors[cssSelectorObject.selectorName],
        null
      );
      if (!startNode) {
        return;
      }
    } else if (cssSelectorObject.selector) {
      startNode = startNode.querySelector(cssSelectorObject.selector);
    }
    node = findRelativeNode(
      startNode,
      cssSelectorObject.DOMSearch,
      selectorParameter
    );
  } else {
    node = document.querySelector(cssSelectorObject);
  }
  if (!node) {
    console.error("didn't find the node", cssSelectorObject);
    return null;
  }
  console.log('found a node:', node);
  return node;
};

const findRelativeNode = (startNode, DOMSearch, selectorParameter) => {
  let currentNode = startNode;
  let traversalSequence = DOMSearch.split(',').map(str => str.trim());
  // console.log('searching for node traversal sequence is: ', traversalSequence);
  for (let i = 0; i < traversalSequence.length; i++) {
    if (!currentNode) {
      console.error('error when searching for relative node!!!');
      return;
    }
    let currentDOMJump = traversalSequence[i].split(':').map(str => str.trim());
    // console.log('currentDOMJump: ', currentDOMJump);
    if (currentDOMJump.length == 1 && currentNode[currentDOMJump[0]]) {
      console.log('domjump without argument: ', currentDOMJump[0]);
      currentNode = currentNode[currentDOMJump[0]];
    } else if (currentDOMJump.length > 1) {
      console.log('domjump with argument: ', currentDOMJump);
      let command = currentDOMJump[0];
      let index = currentDOMJump[1];
      if (index == 'i') {
        index = parseInt(selectorParameter);
      }

      currentNode = currentNode[command][index];
    } else {
      console.error('error traversing DOMSearch array: ', currentDOMJump);
      return null;
    }
    console.log('currentNode in looped search: ', currentNode);
  }
  return currentNode;
};

const hideElement = node => {
  if (!node) {
    console.error('invalid input to hideElement function:', node);
    return;
  }
  // node.style.display = "none";
  node.classList.add('hide');
};

const showElement = node => {
  if (!node) {
    console.error('invalid input to showElement function:', node);
    return;
  }
  node.classList.remove('hide');
};

const updateVisibilityFromShowHideObject = item => {
  console.log('UPDATEVISIBILITYFROMSHOWHIDEOBJECT CALLED WITH: ', item);
  let selectorNameArray = item.cssSelectorName.split(':');
  let selectorName = selectorNameArray[0];
  let selectorParameter = null;
  if (selectorNameArray[1]) {
    selectorParameter = selectorNameArray[1];
  }
  let cssSelectorObject = state.facebookCssSelectors[selectorName];
  // console.log("retrieved cssSelectorObject: ", cssSelectorObject);

  let node = getNodeFromCssObject(
    document,
    cssSelectorObject,
    selectorParameter
  );
  if (!node) {
    return;
  }

  if (item.customStylesWhenHidden) {
    item.customStylesWhenHidden.enabled = item.hide;
    applyCustomCssObject(item.customStylesWhenHidden);
  }

  // if (item.labelCssSelectorName) {
  //   console.log(
  //     "Also extracting option label from DOM using",
  //     item.labelCssSelectorName
  //   );
  //   let labelCssSelectorObject =
  //     state.facebookCssSelectors[item.labelCssSelectorName];
  //   let label = getNodeFromCssObject(node, labelCssSelectorObject, null);
  //   item.name = label;
  //   // sendStateUpdate(state);
  // }
  // console.log("changing element: ", item.cssSelector, " to ", item.hide);
  if (item.hide) {
    hideElement(node);
  } else {
    showElement(node);
  }
};

const updateVisibilityAll = () => {
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
            updateVisibilityFromShowHideObject(group.option);
          }
          if (group.options) {
            for (let option of group.options) {
              updateVisibilityFromShowHideObject(option);
            }
          }
        }
      }
      if (category.options) {
        for (let option of category.options) {
          updateVisibilityFromShowHideObject(option);
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

const fetchLabelsAndAddToState = () => {
  // console.log("FETCHING ALL OPTION OBJECTS IN STATE!!!");
  function addLabel(optionObj) {
    if (optionObj.labelCssSelectorName) {
      let selectorNameArray = optionObj.cssSelectorName.split(':');
      let selectorName = selectorNameArray[0];
      let selectorParameter = null;
      if (selectorNameArray[1]) {
        selectorParameter = selectorNameArray[1];
      }
      let cssSelectorObject = state.facebookCssSelectors[selectorName];
      // console.log("retrieved cssSelectorObject: ", cssSelectorObject);

      let node = getNodeFromCssObject(
        document,
        cssSelectorObject,
        selectorParameter
      );
      if (!node) return;

      console.log(
        'Extracting option label from DOM using',
        optionObj.labelCssSelectorName
      );
      let labelCssSelectorObject =
        state.facebookCssSelectors[optionObj.labelCssSelectorName];
      let label = getNodeFromCssObject(node, labelCssSelectorObject, null);
      if (!label) {
        return;
      }
      optionObj.name = label;
      console.log(label);
    }
  }
  // console.log("state before label fetch: ", state);
  applyToAllOptionObjectsInState(addLabel, state);
  // console.log("state after label fetch: ", state);
};

const updateStyles = () => {
  for (let customCssItem of state.customCss) {
    applyCustomCssObject(customCssItem);
  }
};

const applyCustomCssObject = customCssObj => {
  if (!style) {
    return;
  }
  let selector;
  if (customCssObj.selector) {
    selector = customCssObj.selector;
  } else if (customCssObj.cssSelectorName) {
    selector = state.facebookCssSelectors[customCssObj.cssSelectorName];
  } else {
    console.error('OOMG!!! CRASH OF DOOOM!!! CRYYY');
    return;
  }

  //Check if rule is already present
  let ruleList = style.sheet.cssRules;
  let foundCssRule = undefined;
  for (let candidateCssRule of ruleList) {
    if (
      candidateCssRule.type == CSSRule.STYLE_RULE && // Just checking if this is a normal css rule
      candidateCssRule.selectorText == selector
    ) {
      foundCssRule = candidateCssRule;
      break;
    }
  }
  if (foundCssRule) {
    console.log('style selector already present!');
    if (customCssObj.enabled) {
      console.log('setting css property: ', customCssObj);
      foundCssRule.style.setProperty(
        customCssObj.property,
        customCssObj.value + (customCssObj.unit ? customCssObj.unit : '')
      );
    } else {
      // console.log("removing css property: ", customCssItem);
      foundCssRule.style.removeProperty(customCssObj.property);
    }
  } else {
    console.log('inserting new css rule: ', customCssObj);
    let cssString = customCssObj.enabled
      ? `${selector} {${customCssObj.property}: ${customCssObj.value}${
          customCssObj.unit ? customCssObj.unit : ''
        };}`
      : `${selector} {}`;
    console.log('composed cssString from js object:', cssString);
    style.sheet.insertRule(cssString);
  }
};

const updateComposerAudience = () => {
  // console.log("updateComposerAudience Called");
  let selectors = state.facebookCssSelectors;

  let composer = document.querySelector(selectors.composer);
  if (!composer) {
    console.error('no composer found. Maybe css selector changed by facebook?');
    return;
  }
  let composerFooter = composer.querySelector(selectors.composerFooter);
  // console.log("composer: ", composer);
  let checkBoxes = composerFooter.querySelectorAll('[role=checkbox]');
  // console.log("checkBoxes: ", checkBoxes);
  if (checkBoxes.length) {
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
      buttonContainer.classList.add('red-highlight-border');
    }
  }
};

const updateShareIcons = () => {
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
      setDisplayForShareIconAndShareText(postWrapper, false, true);
    }
  } else {
    for (let postWrapper of postContentWrappers) {
      setDisplayForShareIconAndShareText(postWrapper, true, false);
    }
  }
};

const setDisplayForShareIconAndShareText = (
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
    showElement(iconNode);
    showElement(dot);
  } else {
    hideElement(iconNode);
    hideElement(dot);
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
    showElement(textNode);
  } else {
    hideElement(textNode);
  }
};

const onBodyTagLoaded = async () => {
  console.log('body tag added to DOM');
  style = document.createElement('style');
  style.id = 'style-tag';
  document.head.appendChild(style);
  console.log('added custom style tag to head tag');
  await stateLoadedPromise;
  // fetchLabelsAndAddToState();
  updateStyles();
};

// document.addEventListener("DOMContentLoaded", () =>
//   console.log("DOCUMENT LOADED")
// );

console.log(`YOO! FB4Seniles loaded!!!`);
