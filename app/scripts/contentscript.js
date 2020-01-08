import MutationSummary from "mutation-summary";

let state = {};
let style = undefined;

browser.runtime.onMessage.addListener(message => {
  console.log("msg received: ", message);
  state = message;
  updateVisibilityAll();
  updateStyles();
});

browser.runtime.sendMessage("stateRequest").then(response => {
  console.log("response received: ", response);
  state = response;

  if (!state.thingsToHide) {
    console.error("thingsToHide is null or undefined");
    return;
  }

  updateStyles();

  // updateVisibilityAll();

  let watchedNodesQuery = state.thingsToHide.map(el => {
    return { element: el.cssSelector };
  });

  // we want to react as soon the head tag is inserted into the DOM.
  // Unfortunately it doesn't seem possible to observe the head tag.
  // So let's instead observe the body tag. It should presumably load directly after the head tag.
  watchedNodesQuery.push({ element: "body" });

  console.log("watchedNodes: ", watchedNodesQuery);
  let nodeObserver = new MutationSummary({
    callback: nodeChangeHandler,
    queries: watchedNodesQuery
  });
});

const nodeChangeHandler = summaries => {
  console.log("node summary was triggered");
  console.log(summaries);

  for (let summary of summaries) {
    for (let node of summary.added) {
      //was it the head tag?
      if (node.matches("body")) {
        onBodyTagLoaded();
      }
      for (let item of state.thingsToHide) {
        if (node.matches(item.cssSelector)) {
          if (item.hide) {
            hideElement(node);
          } else {
            showElement(node);
          }
        }
      }
    }
  }
};

const hideElement = node => {
  node.style.display = "none";
};

const showElement = node => {
  node.style.removeProperty("display");
};

const updateVisibilityAll = () => {
  if (!state.thingsToHide) {
    console.error("thingsToHide is null or undefined");
    return;
  }
  for (let item of state.thingsToHide) {
    let node = document.querySelector(item.cssSelector);
    if (!node) {
      console.error("didn't find the node", item.cssSelector);
      continue;
    }
    console.log("changing element: ", item.cssSelector, " to ", item.hide);
    if (item.hide) {
      hideElement(node);
    } else {
      showElement(node);
    }
  }
};

const updateStyles = () => {
  if (!style) {
    return;
  }
  for (let customCssItem of state.customCss) {
    //Check if rule is already present
    let ruleList = style.sheet.cssRules;
    let foundCssRule = undefined;
    for (let candidateCssRule of ruleList) {
      if (
        candidateCssRule.type == CSSRule.STYLE_RULE &&
        candidateCssRule.selectorText == customCssItem.selector
      ) {
        foundCssRule = candidateCssRule;
        break;
      }
    }
    if (foundCssRule) {
      console.log("style already present!");
      console.log("styleDeclaration:", foundCssRule.style);
      foundCssRule.style.setProperty(
        customCssItem.property,
        customCssItem.value + customCssItem.unit
      );
    } else {
      console.log("inserting new css rule: ", customCssItem);
      let cssString = `${customCssItem.selector} {${customCssItem.property}: ${customCssItem.value} ${customCssItem.unit}}`;
      console.log("cssString:", cssString);
      style.sheet.insertRule(cssString);
    }
  }
};

const onBodyTagLoaded = () => {
  console.log("body tag added to DOM");
  style = document.createElement("style");
  style.id = "style-tag";
  document.head.appendChild(style);
  console.log("added custom style tag to head tag");
};

// document.addEventListener("DOMContentLoaded", () =>
//   console.log("DOCUMENT LOADED")
// );

console.log(`YOO! FB4Seniles loaded!!!`);
