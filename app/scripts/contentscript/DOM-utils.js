let style = undefined
let selectors
const init = facebookCssSelectors => {
  selectors = facebookCssSelectors
}

const digForParent = (node, parents = 0) => {
  if (!node || parents === 0) {
    return node
  }
  return digForParent(node.parentElement, parents - 1)
}

const getNodeForText = (text, parents = 0) => {
  const node = document.evaluate(
    `//*[text()='${text}']`,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
  return digForParent(node, parents)
}

const getNodeFromCssObject = (
  cssSelectorObject,
  startNode = document,
  selectorParameter
) => {
  let node = null
  if (typeof cssSelectorObject === 'object' && cssSelectorObject !== null) {
    // console.log("retrieving node from traversal string", cssSelectorObject);
    if (cssSelectorObject.multiple) {
      return document.querySelectorAll(cssSelectorObject.selector)
    }
    if (cssSelectorObject.parentSelectorName) {
      startNode = getNodeFromCssObject(
        selectors[cssSelectorObject.parentSelectorName],
        startNode
      )
      if (!startNode) {
        return
      }
    }
    if (cssSelectorObject.evaluate && selectorParameter) {
      let key = cssSelectorObject.evaluateKey
        ? `@${cssSelectorObject.evaluateKey}`
        : 'text()'

      let evaluatedNode = document.evaluate(
        `//*[${key}='${selectorParameter}']`,
        startNode,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue
      if (cssSelectorObject.DOMSearch) {
        startNode = evaluatedNode
        node = findRelativeNode(
          startNode,
          cssSelectorObject.DOMSearch,
          selectorParameter
        )
      } else {
        node = evaluatedNode
      }
    } else if (!cssSelectorObject.DOMSearch) {
      node = startNode.querySelector(cssSelectorObject.selector)
      if (!node && cssSelectorObject.altSelector) {
        node = startNode.querySelector(cssSelectorObject.altSelector)
      }
    } else {
      if (cssSelectorObject.selector) {
        startNode = startNode.querySelector(cssSelectorObject.selector)
      }
      node = findRelativeNode(
        startNode,
        cssSelectorObject.DOMSearch,
        selectorParameter
      )
    }
  } else {
    node = document.querySelector(cssSelectorObject)
  }
  if (!node) {
    return null
  }
  return node
}

const findRelativeNode = (startNode, DOMSearch, selectorParameter) => {
  let currentNode = startNode
  let traversalSequence = DOMSearch.split(',').map(str => str.trim())
  // console.log('searching for node traversal sequence is: ', traversalSequence);
  for (let i = 0; i < traversalSequence.length; i++) {
    if (!currentNode) return
    let currentDOMJump = traversalSequence[i].split(':').map(str => str.trim())
    // console.log('currentDOMJump: ', currentDOMJump);
    if (currentDOMJump.length == 1 && currentNode[currentDOMJump[0]]) {
      // console.log('domjump without argument: ', currentDOMJump[0]);
      currentNode = currentNode[currentDOMJump[0]]
    } else if (currentDOMJump.length > 1) {
      // console.log('domjump with argument: ', currentDOMJump);
      let command = currentDOMJump[0]
      let index = currentDOMJump[1]
      if (index == 'i') {
        index = parseInt(selectorParameter)
      }

      currentNode = currentNode[command][index]
    } else {
      // console.error('error traversing DOMSearch array: ', currentDOMJump);
      return null
    }
    // console.log('currentNode in looped search: ', currentNode);
  }
  return currentNode
}

const hideElement = node => {
  if (!node || !node.classList) {
    throw ('invalid input to hideElement function:', node)
    return
  }
  // node.style.display = "none";
  node.classList.add('hide')
}

const showElement = node => {
  if (!node || !node.classList) {
    throw ('invalid input to showElement function:', node)
    return
  }
  node.classList.remove('hide')
}

const updateVisibilityFromTextSearch = item => {
  const node = getNodeForText(item.textSearch, item.digForParents)
  if (node) {
    if (item.hide) {
      hideElement(node)
    } else {
      showElement(node)
    }
  }
}

const updateVisibilityFromShowHideObject = item => {
  if (item.textSearch) {
    return updateVisibilityFromTextSearch(item)
  }

  try {
    let selectorNameList = item.cssSelectorName
      .split(',')
      .map(str => str.trim())
    // console.log('selectorname(s):', selectorNameList);

    for (let selectorNameString of selectorNameList) {
      // console.log('updating visibility for selectorName: ', selectorNameString);
      let selectorAndParameter = selectorNameString.split(':')
      let selectorName = selectorAndParameter[0]
      let selectorParameter = null
      if (selectorAndParameter[1]) {
        selectorParameter = selectorAndParameter[1]
      }
      let cssSelectorObject = selectors[selectorName]
      // console.log("retrieved cssSelectorObject: ", cssSelectorObject);

      let node
      try {
        node = getNodeFromCssObject(
          cssSelectorObject,
          document,
          selectorParameter
        )
      } catch (e) {
        console.error(
          'error finding node: ',
          e,
          cssSelectorObject,
          selectorParameter
        )
      }
      if (!node) {
        continue
      }

      const nodesToHide = node.length && node.length > 0 ? node : [node]
      nodesToHide.forEach(_node => {
        if (item.hide) {
          hideElement(_node)
        } else {
          showElement(_node)
        }
      })

      if (item.id === 'composer-add-pic') {
        const parent = nodesToHide[0].parentElement
        const children = [...parent.children].filter(
          elem => elem.nodeName === 'DIV'
        )
        const allChildrenHidden = children.every(elem =>
          elem.classList.contains('hide')
        )
        if (allChildrenHidden) {
          hideElement(parent)
        } else {
          showElement(parent)
        }
        console.log('allChildrenHidden', allChildrenHidden)
      }
    }
  } catch (e) {
    console.log(e)
    console.error({ item })
  }
}

const createStyleTag = () => {
  style = document.createElement('style')
  style.id = 'style-tag'
  document.head.appendChild(style)
  console.log('added custom style tag to head tag')
}

export default {
  init,
  getNodeFromCssObject,
  updateVisibilityFromShowHideObject,
  createStyleTag,
  showElement,
  hideElement,
  getNodeForText,
}
