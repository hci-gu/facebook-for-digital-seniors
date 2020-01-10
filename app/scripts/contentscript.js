import MutationSummary from "mutation-summary";

let state = {};

let style = undefined;

browser.runtime.onMessage.addListener(message => {
  console.log("msg received: ", message);
  state = message;
  updateVisibilityAll();
  updateStyles();
  updateShareIcons();
});

browser.runtime.sendMessage("stateRequest").then(response => {
  console.log("response received: ", response);
  state = response;

  if (!state.thingsToHide) {
    console.error("thingsToHide is null or undefined");
    return;
  }

  updateStyles();
  updateShareIcons();

  // updateVisibilityAll();

  let watchedNodesQuery = state.thingsToHide.map(el => {
    return { element: el.cssSelector };
  });

  watchedNodesQuery.push({ element: ".userContentWrapper" });

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

      if (node.matches(".userContentWrapper")) {
        updateShareIcons();
      }
    }
  }
};

const hideElement = node => {
  if (!node) {
    console.error("invalid input to hideElement function:", node);
    return;
  }
  node.style.display = "none";
};

const showElement = node => {
  if (!node) {
    console.error("invalid input to showElement function:", node);
    return;
  }
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
      if (customCssItem.enabled) {
        foundCssRule.style.setProperty(
          customCssItem.property,
          customCssItem.value + customCssItem.unit
        );
      } else {
        foundCssRule.style.removeProperty(customCssItem.property);
      }
    } else {
      console.log("inserting new css rule: ", customCssItem);
      let cssString = `${customCssItem.selector} {${customCssItem.property}: ${customCssItem.value} ${customCssItem.unit}}`;
      console.log("cssString:", cssString);
      style.sheet.insertRule(cssString);
    }
  }
};

const updateShareIcons = () => {
  let selectors = state.facebookCssSelectors;
  let iconSelectorString = selectors.publicIconClass.concat(
    ", ",
    selectors.membersIconClass,
    ", ",
    selectors.friendsIconClass,
    ", ",
    selectors.customShareIconClass
  );
  console.log("iconSelectorString: ", iconSelectorString);
  let foundIcons = document.querySelectorAll(iconSelectorString);
  if (!foundIcons) {
    console.error("no icons found! Have FB perhaps renamed the cssSelectors?");
    return;
  }

  let topSections = document.querySelectorAll(selectors.topSectionInPostClass);
  if (!topSections) {
    console.error(
      "no topSections found! Have FB perhaps renamed the cssSelectors?"
    );
    return;
  }
  console.log("found topSections:", topSections);

  // let dotsInPosts = document.querySelectorAll(selectors.smallDotInPostClass);
  // console.log("found dots:", dotsInPosts);

  if (state.audienceSettings.replaceAudienceIconsWithText) {
    for (let topSection of topSections) {
      hideIconShowText(topSection, iconSelectorString);
    }
  } else {
    for (let topSection of topSections) {
      showIconHideText(topSection, iconSelectorString);
    }
  }
};

const hideIconShowText = (topSectionNode, iconSelectorString) => {
  let iconNode = topSectionNode.querySelector(iconSelectorString);
  if (iconNode) {
    hideElement(iconNode);
  }
  let dot = topSectionNode.querySelector(
    state.facebookCssSelectors.smallDotInPostClass
  );
  if (dot) {
    hideElement(dot);
  }

  let textNode = topSectionNode.querySelector(".sharing-text");
  if (textNode) {
    console.log("textNode already present. toggling it's display");
    showElement(textNode);
  } else if (!iconNode) {
    console.error(
      "Something went wrong. Couldn't locate an iconNode within the topsection Element"
    );
  } else {
    console.log("no textNode present. Creating one!!!");
    // extract the accesibility text from wrapping elements
    let altText = "";
    if (iconNode.parentElement.tagName === "A") {
      altText = iconNode.parentElement.getAttribute("aria-label");
    } else if (iconNode.parentElement.tagName === "SPAN") {
      altText = iconNode.parentElement.parentElement.getAttribute("aria-label");
    }
    console.log("retrieved alt text: ", altText);
    let textNode = document.createElement("h2");
    textNode.className = "sharing-text";
    textNode.textContent = altText;
    topSectionNode.appendChild(textNode);
  }
};

const showIconHideText = (topSectionNode, iconSelectorString) => {
  let iconNode = topSectionNode.querySelector(iconSelectorString);
  if (iconNode) {
    showElement(iconNode);
  }
  let dot = topSectionNode.querySelector(
    state.facebookCssSelectors.smallDotInPostClass
  );
  if (dot) {
    showElement(dot);
  }

  let textNode = topSectionNode.querySelector(".sharing-text");
  if (textNode) {
    hideElement(textNode);
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
