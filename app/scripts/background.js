browser.runtime.onInstalled.addListener(details => {
  console.log("previousVersion", details.previousVersion);
});

browser.browserAction.setBadgeText({
  text: `BFB`
});

console.log(`BAAAJS! Event Page for Browser Action`);

let state = {
  controlledElements: [
    { name: "Left pane", id: "#left_nav_section_nodes", hide: false },
    {
      name: "Stories",
      id: "#stories_pagelet_below_composer",
      hide: true
    },
    {
      name: "Right Pane",
      id: ".home_right_column",
      hide: true
    },
    {
      name: "Language Panel",
      id: "#pagelet_rhc_footer",
      hide: false
    }
  ]
};

let controlledElements = localStorage.getItem("controlledElements");
if (controlledElements) {
  console.log("state received from localstorage", controlledElements);
  state.controlledElements = controlledElements;
} else {
  console.log(
    "nothing in localstorage. Saving the following",
    state.controlledElements
  );
  localStorage.setItem(
    "controlledElements",
    JSON.stringify(state.controlledElements)
  );
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("message receive: ", msg);
  state.controlledElements = JSON.parse(
    localStorage.getItem("controlledElements")
  );

  if (state) {
    console.log(state);
    sendResponse(state);
  }
});
