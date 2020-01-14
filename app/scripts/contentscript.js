import MutationSummary from "mutation-summary";

let state = {};

let style = undefined;

browser.runtime.onMessage.addListener(message => {
  console.log("msg received: ", message);
  state = message;
  updateVisibilityAll();
  updateStyles();
  updateShareIcons();
  updateComposerAudience();
});

browser.runtime.sendMessage("stateRequest").then(response => {
  console.log("response received: ", response);
  state = response;
  let selectors = state.facebookCssSelectors;

  if (!state.thingsToHide) {
    console.error("thingsToHide is null or undefined");
    return;
  } else {
    console.log("state is: ", state);
  }

  updateStyles();
  updateShareIcons();

  // updateVisibilityAll();

  let watchedNodesQuery = [];

  // Warning. Non obvious use of reduce function (as is always the case when using reduce...)
  // We simply merge the hide/show cssSelectors to a string with comma separation (css selector list)
  let hideSelectorListString = state.thingsToHide.reduce(
    (accuString, currentSelector, idx) => {
      // console.log(accuString);
      return idx == 0
        ? currentSelector.cssSelector
        : accuString + ", " + currentSelector.cssSelector;
    },
    ""
  );
  watchedNodesQuery.push({ element: hideSelectorListString });

  watchedNodesQuery.push({
    element: selectors.postContainerClass
  });

  watchedNodesQuery.push({
    element: selectors.composerFooter
  });

  watchedNodesQuery.push({
    attribute: "aria-checked"
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

  let selectors = state.facebookCssSelectors;

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

      if (node.matches(selectors.postContainerClass)) {
        updateShareIcons();
      }

      if (node.matches(selectors.composerFooter)) {
        updateComposerAudience();
      }
    }
    if (summary.valueChanged && summary.valueChanged.length) {
      updateComposerAudience();
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

const updateComposerAudience = () => {
  console.log("updating Composer Audience");
  let selectors = state.facebookCssSelectors;

  let composerFooter = document.querySelector(selectors.composerFooter);
  if (!composerFooter) {
    console.error(
      "no composer footer found. Maybe css selector changed by facebook?"
    );
    return;
  }
  console.log("composerFooter: ", composerFooter);
  let checkBoxes = composerFooter.querySelectorAll("[role=checkbox]");
  console.log("checkBoxes: ", checkBoxes);
  for (let checkBox of checkBoxes) {
    let selectAudienceWrapper = checkBox.parentElement.querySelector(
      selectors.composerFeedAudienceSelector +
        ", " +
        selectors.composerStoriesAudienceSelector
    );
    if (!selectAudienceWrapper) {
      console.error(
        "no audience selector element found. Was the css selector perhaps changed by facebook?"
      );
      return;
    }

    if (
      checkBox.getAttribute("aria-checked") == "true" &&
      state.audienceSettings.highlightAudienceWhenPosting
    ) {
      selectAudienceWrapper.classList.add("red-highlight-border");
    } else {
      selectAudienceWrapper.classList.remove("red-highlight-border");
    }
  }

  // let selectFeedAudienceWrapper = document.querySelector(
  //   selectors.composerFeedAudienceSelector
  // );
  // if (!selectFeedAudienceWrapper) {
  //   console.error("No selectaudience toggle found!!");
  //   return;
  // }

  // if (state.audienceSettings.highlightAudienceWhenPosting) {
  //   selectFeedAudienceWrapper.classList.add("red-highlight-border");
  // } else {
  //   selectFeedAudienceWrapper.classList.remove("red-highlight-border");
  // }
};

const updateShareIcons = () => {

  // // Update share Icon
  // let iconList = document.querySelectorAll('[data-tooltip-content][aria-label][role="img"]');

  // iconList.forEach((theItem) => {
  //   theItem.className = "sharedIcon";
  //   theItem.innerHTML = theItem.getAttribute('aria-label');
  // })


  let selectors = state.facebookCssSelectors;
  // let iconSelectorString = selectors.publicIconClass.concat(
  //   ", ",
  //   selectors.membersIconClass,
  //   ", ",
  //   selectors.friendsIconClass,
  //   ", ",
  //   selectors.customShareIconClass
  // );
  let iconSelectorString = selectors.shareIconAttributes;
  console.log("iconSelectorString: ", iconSelectorString);
  let foundIcons = document.querySelectorAll(iconSelectorString);
  if (!foundIcons) {
    console.error("no icons found! Have FB perhaps renamed the cssSelectors?");
    return;
  }

  let postContentWrapper = document.querySelectorAll(selectors.postContainerClass);
  if (!postContentWrapper) {
    console.error(
      "no postContentWrapper found! Have FB perhaps renamed the cssSelectors?"
    );
    return;
  }
  console.log("found postContentWrapper:", postContentWrapper);

  // let dotsInPosts = document.querySelectorAll(selectors.smallDotInPostClass);
  // console.log("found dots:", dotsInPosts);

  if (state.audienceSettings.replaceAudienceIconsWithText) {
    for (let postWrapper of postContentWrapper) {
      hideIconShowText(postWrapper, iconSelectorString);
    }
  } else {
    for (let postWrapper of postContentWrapper) {
      showIconHideText(postWrapper, iconSelectorString);
    }
  }
};

const hideIconShowText = (postContentWrapper, iconSelectorString) => {
  let iconNode = postContentWrapper.querySelector(iconSelectorString);
  if (iconNode) {
    console.log("found iconNode: ", iconNode);
    hideElement(iconNode);
  }
  let dot = postContentWrapper.querySelector(
    state.facebookCssSelectors.smallDotInPostClass
  );
  if (dot) {
    hideElement(dot);
  }

  let textNode = postContentWrapper.querySelector(".sharing-text");
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
    altText = iconNode.getAttribute("data-tooltip-content");
    // if (iconNode.tagName === "A") {
    //   altText = iconNode.getAttribute("aria-label");
    // } else if (iconNode.parentElement.tagName === "SPAN") {
    //   altText = iconNode.parentElement.getAttribute("aria-label");
    // }

    console.log("retrieved alt text: ", altText);
    let textNode = document.createElement("h2");
    textNode.className = "sharing-text";
    textNode.textContent = altText;
    postContentWrapper.querySelector(".clearfix").appendChild(textNode);
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
