let style = undefined;

const getNodeFromCssObject = (
  state,
  startNode,
  cssSelectorObject,
  selectorParameter
) => {
  // console.log(
  //   'getNodeFromCssObject:',
  //   startNode,
  //   cssSelectorObject,
  //   selectorParameter
  // );
  let node = null;
  if (typeof cssSelectorObject === 'object' && cssSelectorObject !== null) {
    // console.log("retrieving node from traversal string", cssSelectorObject);
    if (cssSelectorObject.multiple) {
      return document.querySelectorAll(cssSelectorObject.selector);
    }
    if (cssSelectorObject.parentSelectorName) {
      startNode = getNodeFromCssObject(
        state,
        startNode,
        state.facebookCssSelectors[cssSelectorObject.parentSelectorName],
        null
      );
      if (!startNode) {
        return;
      }
    }
    if (!cssSelectorObject.DOMSearch) {
      node = startNode.querySelector(cssSelectorObject.selector);
    } else {
      if (cssSelectorObject.selector) {
        startNode = startNode.querySelector(cssSelectorObject.selector);
      }
      node = findRelativeNode(
        startNode,
        cssSelectorObject.DOMSearch,
        selectorParameter
      );
    }
  } else {
    node = document.querySelector(cssSelectorObject);
  }
  if (!node) {
    // console.error("didn't find the node", cssSelectorObject);
    return null;
  }
  // console.log('found a node:', node);
  return node;
};

const findRelativeNode = (startNode, DOMSearch, selectorParameter) => {
  let currentNode = startNode;
  let traversalSequence = DOMSearch.split(',').map((str) => str.trim());
  // console.log('searching for node traversal sequence is: ', traversalSequence);
  for (let i = 0; i < traversalSequence.length; i++) {
    if (!currentNode) {
      console.error('error when searching for relative node!!!');
      return;
    }
    let currentDOMJump = traversalSequence[i]
      .split(':')
      .map((str) => str.trim());
    // console.log('currentDOMJump: ', currentDOMJump);
    if (currentDOMJump.length == 1 && currentNode[currentDOMJump[0]]) {
      // console.log('domjump without argument: ', currentDOMJump[0]);
      currentNode = currentNode[currentDOMJump[0]];
    } else if (currentDOMJump.length > 1) {
      // console.log('domjump with argument: ', currentDOMJump);
      let command = currentDOMJump[0];
      let index = currentDOMJump[1];
      if (index == 'i') {
        index = parseInt(selectorParameter);
      }

      currentNode = currentNode[command][index];
    } else {
      // console.error('error traversing DOMSearch array: ', currentDOMJump);
      return null;
    }
    // console.log('currentNode in looped search: ', currentNode);
  }
  return currentNode;
};

const hideElement = (node) => {
  if (!node) {
    console.error('invalid input to hideElement function:', node);
    return;
  }
  // node.style.display = "none";
  node.classList.add('hide');
};

const showElement = (node) => {
  if (!node) {
    console.error('invalid input to showElement function:', node);
    return;
  }
  node.classList.remove('hide');
};

const updateVisibilityFromShowHideObject = (state, item) => {
  // console.log('UPDATEVISIBILITYFROMSHOWHIDEOBJECT CALLED WITH: ', item);
  try {
  let selectorNameList = item.cssSelectorName
    .split(',')
    .map((str) => str.trim());
  // console.log('selectorname(s):', selectorNameList);

  for (let selectorNameString of selectorNameList) {
    // console.log('updating visibility for selectorName: ', selectorNameString);
    let selectorAndParameter = selectorNameString.split(':');
    let selectorName = selectorAndParameter[0];
    let selectorParameter = null;
    if (selectorAndParameter[1]) {
      selectorParameter = selectorAndParameter[1];
    }
    let cssSelectorObject = state.facebookCssSelectors[selectorName];
    // console.log("retrieved cssSelectorObject: ", cssSelectorObject);

    let node;
    try {
      node = getNodeFromCssObject(
        state,
        document,
        cssSelectorObject,
        selectorParameter
      );
    } catch (e) {
      console.error('error finding node: ', cssSelectorObject, selectorParameter)
    }
    if (!node) {
      continue;
    }

    if (item.customStylesWhenHidden) {
      item.customStylesWhenHidden.enabled = item.hide;
      applyCustomCssObject(state, item.customStylesWhenHidden);
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
    if (node.length && node.length > 0) {
      node.forEach(_node => {
        if (item.hide) {
          hideElement(_node);
        } else {
          showElement(_node);
        }
      })
    } else if (node && node.length == undefined) {
      if (item.hide) {
        hideElement(node);
      } else {
        showElement(node);
      }
    }
  }
  } catch(e) {
    console.log(e)
    console.error({ item })
  }
};

const applyCustomCssObject = (state, customCssObj) => {
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
    // console.log('style selector already present!');
    if (customCssObj.enabled) {
      // console.log('setting css property: ', customCssObj);
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
    // console.log('composed cssString from js object:', cssString);
    style.sheet.insertRule(cssString);
  }
};

const createStyleTag = () => {
  style = document.createElement('style');
  style.id = 'style-tag';
  document.head.appendChild(style);
  console.log('added custom style tag to head tag');
};

export default {
  getNodeFromCssObject,
  updateVisibilityFromShowHideObject,
  applyCustomCssObject,
  createStyleTag,
  showElement,
  hideElement,
};
