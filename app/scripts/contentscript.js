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
  // node.style.display = "none";
  node.classList.add("hide");
};

const showElement = node => {
  if (!node) {
    console.error("invalid input to showElement function:", node);
    return;
  }
  node.classList.remove("hide");
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
  let selectors = state.facebookCssSelectors;
  let composerContainer = document.querySelector(selectors.composer);
  let closeButton = composerContainer.querySelector(
    selectors.composerCloseButton
  );
  if (!closeButton) {
    return;
  }

  console.log("updating Composer Audience");
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
    let selectAudienceButton = checkBox.nextElementSibling.firstElementChild;
    // let selectAudienceWrapper = checkBox.parentElement.querySelector(
    //   selectors.composerFeedAudienceSelector +
    //     ", " +
    //     selectors.composerStoriesAudienceSelector
    // );
    if (!selectAudienceButton) {
      console.error(
        "no audience selector element found. Was the css selector perhaps changed by facebook?"
      );
      return;
    }

    if (
      checkBox.getAttribute("aria-checked") == "true" &&
      state.audienceSettings.highlightAudienceWhenPosting
    ) {
      selectAudienceButton.classList.add("red-highlight-border");
    } else {
      selectAudienceButton.classList.remove("red-highlight-border");
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
      "no postContentWrapper found! Have FB perhaps renamed the cssSelectors?"
    );
    return;
  }
  console.log("found postContentWrappers:", postContentWrappers);

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
    console.log(
      "no icon element found. Have facebook changed the css selectors?"
    );
    return;
  }
  let dot = iconNode.previousElementSibling;
  if (!dot) {
    console.log(
      "no dot element found. Have facebook changed the css selectors?"
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
  let sharingTextClass = "sharing-text";
  let textNode = postContainer.querySelector("." + sharingTextClass);
  if (!textNode) {
    console.log("no textNode present. Creating one!!!");
    // extract the accesibility text from wrapping elements
    let altText = "";
    altText = iconNode.getAttribute("data-tooltip-content");

    console.log("retrieved alt text: ", altText);
    textNode = document.createElement("h2");
    textNode.classList.add(sharingTextClass);
    textNode.textContent = altText;
    postContainer.querySelector(".clearfix").appendChild(textNode);
  }

  if (showShareText) {
    showElement(textNode);
  } else {
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
