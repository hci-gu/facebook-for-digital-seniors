browser.runtime.onInstalled.addListener(details => {
  console.log("previousVersion", details.previousVersion);
});

browser.browserAction.setBadgeText({
  text: `BFB`
});

// let state = {};

//WHAT IS THIS FILE DOING:
//Check if there is state in local storage.
//If there was a state in local storage. Check that it has the correct object scheme (same as the one in sources).
//If not, throw it away and use the state from source code.
//If no state found in local storage, fall back to using initial state from source code.
//Fetch json with facebook selectors from file on github
//Put the fetched json data into our state object.
//Save the state object to local storage.

const setup = async () => {
  console.log("ENV: ", process.env.NODE_ENV);
  let facebookCssSelectors = await retrieveFacebookCssSelectors();
  console.log("facebookCssSelectors: ", facebookCssSelectors);
  let startState = await initializeState(facebookCssSelectors);
  console.log("startState: ", startState);

  // startState.facebookCssSelectors = facebookCssSelectors;
  localStorage.setItem("state", JSON.stringify(startState));
};

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

const retrieveFacebookCssSelectors = async () => {
  // We ain't wanna have to push the json to github for each edit. So during development we simply require it.
  if (process.env.NODE_ENV === "development") {
    let importedJson = require("../../facebookCssSelectors.json");
    console.log("facebookCssSelectors: ", importedJson);
    return importedJson;
  } else {
    let githubRawUrl = "https://raw.githubusercontent.com/";
    let facebookCssSelectorsJsonPath =
      "Dealerpriest/facebook-for-elderly/master/facebookCssSelectors.json";

    let response = await fetch(githubRawUrl + facebookCssSelectorsJsonPath);
    console.log("fetched json from github");

    return await response.json();
  }
};

const initializeState = async facebookCssSelectors => {
  const initialState = {
    stateBreakingChangeCounter: 1,
    thingsToHide: [
      {
        id: "lpane",
        name: "Vänsterpanel",
        cssSelector: "#left_nav_section_nodes",
        hide: false
      },
      {
        id: "stories",
        name: "Händelser",
        cssSelector: "#stories_pagelet_below_composer",
        hide: true
      },
      {
        id: "rpane",
        name: "Högerpanel",
        cssSelector: ".home_right_column",
        hide: true
      },
      {
        id: "language",
        name: "Språkruta",
        cssSelector: "#pagelet_rhc_footer",
        hide: false
      }
    ],
    customCss: [
      {
        enabled: false,
        id: "zoom",
        name: "Zoom",
        selector: "body",
        property: "zoom",
        unit: "%",
        value: 100,
        min: 50,
        max: 200
      }
      // {
      //   enabled: false,
      //   id: "paragraphsize",
      //   name: "Brödtext textstorlek",
      //   selector: "p",
      //   property: "font-size",
      //   unit: "px",
      //   value: 19,
      //   min: 10,
      //   max: 40
      // },
      // {
      //   enabled: false,
      //   id: "textsize",
      //   name: "Övergripande textstorlek",
      //   selector: "body",
      //   property: "font-size",
      //   unit: "%",
      //   value: 100,
      //   min: 60,
      //   max: 240
      // }
    ],
    audienceSettings: {
      replaceAudienceIconsWithText: true,
      highlightAudienceWhenPosting: true
    },
    facebookCssSelectors: facebookCssSelectors
  };

  let receivedState = JSON.parse(localStorage.getItem("state"));
  if (receivedState) {
    console.log(
      "previously saved state received from localStorage",
      receivedState
    );
    if (
      !hasSameProperties(receivedState, initialState) ||
      !hasSameProperties(initialState, receivedState) ||
      stateChangeCounterUpdated(receivedState, initialState)
    ) {
      console.log(
        "discrepency found in state from local storage. Fallback to using initial state from source code"
      );
      return initialState;
    }
    return receivedState;
  } else {
    console.log(
      "nothing in localStorage. using initial state from source code",
      initialState
    );
    // localStorage.setItem("state", JSON.stringify(initialState));
    return initialState;
  }
};

function stateChangeCounterUpdated(firstState, secondState) {
  if (
    !firstState.stateBreakingChangeCounter ||
    !secondState.stateBreakingChangeCounter
  ) {
    return true;
  }
  return (
    firstState.stateBreakingChangeCounter !==
    secondState.stateBreakingChangeCounter
  );
}

//We ignore comparison of the subtree containing cssSelectors. This is because we will always use the remote one either way.
// This has the result that the subtree in the source code is undefined.
function hasSameProperties(obj1, obj2) {
  try {
    console.log("comparison called on: ", obj1, obj2);
    return Object.keys(obj1).every(function(property) {
      // if (property == "facebookCssSelectors") {
      //   console.log(
      //     "found object property named facebookCssSelectors. Ignoring comparison of that subtree."
      //   );
      //   return true;
      // } else
      if (typeof obj1[property] !== "object") {
        return obj2.hasOwnProperty(property);
      } else {
        if (!obj2.hasOwnProperty(property)) {
          return false;
        }
        return hasSameProperties(obj1[property], obj2[property]);
      }
    });
  } catch (e) {
    //If bug. fallback to consider the comparison not equal.
    console.error("some bug in the hasSameProperties function");
    console.error(e);
    return false;
  }
}

//Now GOOOO!
setup();
