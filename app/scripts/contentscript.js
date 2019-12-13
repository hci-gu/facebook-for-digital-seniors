import MutationSummary from "mutation-summary";

// let idsToRemove = [];
let state = {};

function hideElement(node) {
  node.style.display = "none";
}

function showElement(node) {
  node.style.removeProperty("display");
}

function updateVisibility() {
  if (!state.controlledElements) {
    console.error("controlledElements is null or undefined");
    return;
  }
  for (let item of state.controlledElements) {
    let node = document.querySelector(item.id);
    if (!node) {
      console.error("didn't find the node");
      continue;
    }
    console.log("changing element: ", item.id, " to ", item.hide);
    if (item.hide) {
      hideElement(node);
    } else {
      showElement(node);
    }
  }
}

browser.runtime.onMessage.addListener(message => {
  console.log("msg received: ", message);
  state = message;
  updateVisibility();
});

browser.runtime.sendMessage("stateRequest").then(response => {
  console.log("response received: ", response);
  state = response;
  updateVisibility();

  // if (state.idsToRemove) {
  //   idsToRemove = response.idsToRemove.reduce((outputArray, item) => {
  //     if (item.remove) {
  //       outputArray.push(item.id);
  //     }
  //     return outputArray;
  //   }, []);
  // }

  // //Initial removal of elements
  // for (let id of idsToRemove) {
  //   let node = document.querySelector(id);
  //   if (node) {
  //     // node.remove();
  //     hideElement(node);
  //   }
  // }

  if (!state.controlledElements) {
    console.error("controlledElements is null or undefined");
    return;
  }

  let watchedNodesQuery = state.controlledElements.map(el => {
    return { element: el.id };
  });

  let nodeObserver = new MutationSummary({
    callback: nodeChangeHandler,
    queries: watchedNodesQuery
  });
});

const nodeChangeHandler = summaries => {
  updateVisibility(); // Should be safe since mutation-summary won't trigger on changes made in it's own callback.
  console.log(summaries);
  // for (let summary of summaries) {
  //   for (let node of summary.added) {
  //     // node.remove();
  //     hideElement(node);
  //   }
  // }
};

if (window.location.host.includes("facebook.com")) {
  console.log("Prutt!!!!");
} else {
  console.log("not on facebook I think... You CRY!!");
}

console.log(`YOO! FB4seniles loaded!!!`);
