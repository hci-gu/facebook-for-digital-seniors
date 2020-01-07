import MutationSummary from "mutation-summary";

let state = {};
let style;

function hideElement(node) {
  node.style.display = "none";
}

function showElement(node) {
  node.style.removeProperty("display");
}

function updateVisibilityAll() {
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
}

function updateStyles() {
  for (let customCssItem of state.customCss) {
    console.log("inserting new css rule: ", customCssItem);
    let cssString = `${customCssItem.selector} {${customCssItem.property}: ${customCssItem.value}px}`;
    console.log("cssString:", cssString);
    style.sheet.insertRule(cssString);
  }
}

browser.runtime.onMessage.addListener(message => {
  console.log("msg received: ", message);
  state = message;
  updateVisibilityAll();
});

browser.runtime.sendMessage("stateRequest").then(response => {
  console.log("response received: ", response);
  state = response;

  if (!state.thingsToHide) {
    console.error("thingsToHide is null or undefined");
    return;
  }

  style = document.createElement("style");
  style.id = "style-tag";
  document.head.appendChild(style);

  updateStyles();

  // updateVisibilityAll();

  let watchedNodesQuery = state.thingsToHide.map(el => {
    return { element: el.cssSelector };
  });

  let nodeObserver = new MutationSummary({
    callback: nodeChangeHandler,
    queries: watchedNodesQuery
  });
});

const nodeChangeHandler = summaries => {
  console.log("node summary was triggered");
  console.log(summaries);
  // updateVisibilityAll(); // Should be safe since mutation-summary won't trigger on changes made in it's own callback.

  for (let summary of summaries) {
    for (let node of summary.added) {
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

if (window.location.host.includes("facebook.com")) {
  console.log("Prutt!!!!");
} else {
  console.log("not on facebook I think... You CRY!!");
}

console.log(`YOO! FB4Seniles loaded!!!`);
