browser.runtime.onInstalled.addListener(details => {
  console.log("previousVersion", details.previousVersion);
});

browser.browserAction.setBadgeText({
  text: `BFB`
});

let state = {};
const initialState = {
  thingsToHide: [
    { name: "Left pane", cssSelector: "#left_nav_section_nodes", hide: false },
    {
      name: "Stories",
      cssSelector: "#stories_pagelet_below_composer",
      hide: true
    },
    {
      name: "Right Pane",
      cssSelector: ".home_right_column",
      hide: true
    },
    {
      name: "Language Panel",
      cssSelector: "#pagelet_rhc_footer",
      hide: false
    }
  ],
  customCss: [
    {
      name: "brödtext textstorlek",
      selector: "p",
      property: "font-size",
      unit: "px",
      value: 19,
      min: 10,
      max: 40
    },
    {
      name: "övergripande textstorlek",
      selector: "body",
      property: "font-size",
      unit: "%",
      value: 100,
      min: 60,
      max: 240
    }
  ]
};

let receivedState = localStorage.getItem("state");
if (receivedState) {
  console.log("saved state received from localStorage", receivedState);
  state = receivedState;
} else {
  console.log(
    "nothing in localStorage. Saving the following as initial state",
    initialState
  );
  localStorage.setItem("state", JSON.stringify(initialState));
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("message receive: ", msg);

  state = JSON.parse(localStorage.getItem("state"));

  if (state) {
    console.log(state);
    return Promise.resolve(state);
  } else {
    console.error("couldn't retrieve a state from localStorage!");
  }
});
