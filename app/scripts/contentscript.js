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

function changeSharedIcon() {
  // .sp_f6EkU4HBM56.sx_c74ada - members 
  // '.sp_RLFL6-1bUHS.sx_e55dd2' - public
  // '.sp_RLFL6-1bUHS.sx_ecb1ed' - friends

  // change shared icon
  window.addEventListener('load', function () {

    // Public
    let icons = document.querySelectorAll('.sp_RLFL6-1bUHS.sx_e55dd2, .sp_f6EkU4HBM56.sx_c74ada, .sp_RLFL6-1bUHS.sx_ecb1ed');

    icons.forEach((item) => {
      let title = ""

      // check where aria-label is located
      if (item.parentElement.tagName === "A") {
        title = item.parentElement.getAttribute('aria-label');
      } else if (item.parentElement.tagName === "SPAN") {
        title = item.parentElement.parentElement.getAttribute('aria-label');
      }

      item.className = "sharedIcon";
      item.innerHTML = title;
    });


  })

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
  changeSharedIcon();

  // updateVisibilityAll();

  let watchedNodesQuery = state.thingsToHide.map(el => {
    return { element: el.cssSelector };
  });

  watchedNodesQuery.push({ element: ".userContentWrapper" });

  console.log("Watch", watchedNodesQuery);
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
