import Parse from "parse";
import Fingerprint2 from "fingerprintjs2";
import initialState from "./stateSchema.js";
import { isPromiseResolved } from "promise-status-async";

Parse.serverURL = "https://parseapi.back4app.com"; // This is your Server URL
Parse.initialize(
  process.env.PARSE_APP_KEY, // This is your Application ID
  process.env.PARSE_JAVASCRIPT_KEY // This is your Javascript key
);
let loggedInToParse = false;

const generateCredentials = hash => {
  return { username: Fingerprint2.x64hash128(hash), password: hash };
};

const signupToParse = async browserHash => {
  let credentials = generateCredentials(browserHash);
  let user = Parse.User.signUp(
    credentials.username,
    credentials.password
  ).catch(err => console.error("parse signup failed", err));

  if (user) {
    console.log("registered parse user: ", user);
    loggedInToParse = true;
    return user;
  }

  Promise.reject("failed to signUp new user. SAAAAD!");
};

const loginToParse = async browserHash => {
  let user = Parse.User.current();
  if (user) {
    loggedInToParse = true;
    return user;
  }
  console.log("no current user. Trying to login");
  let credentials = generateCredentials(browserHash);
  user = await Parse.User.logIn(credentials.username, credentials.password);

  if (user) {
    loggedInToParse = true;
    return user;
  }

  return Promise.reject("failed to login. NOW CRYYY!");
};

browser.runtime.onInstalled.addListener(details => {
  console.log("previousVersion", details.previousVersion);
});

// browser.browserAction.setBadgeText({
//   text: `BFB`
// });

//we create a promise here that will settle when the fingerprint (hopefully) is received
// let fingerPrintReceived = new Promise();
let resolveContentscriptReady;
let rejectContentscriptReady;
let contentscriptReady = new Promise((resolve, reject) => {
  resolveContentscriptReady = resolve;
  rejectContentscriptReady = reject;
});

//Perhaps a bit bloaty... Could just call sendMessageToPage directly...
const getFingerprintFromContentScript = async () => {
  let response = await sendMessageToPage("getFingerPrint", null).catch(err => {
    console.error("no fingerprint was recevied: ", err);
    return Promise.reject(err);
  });
  return response;
};

//WHAT IS THE SETUP FUNCTION DOING:
//Check if there is state in local storage.
//If there was a state in local storage. Check that it has the correct object schema (same as the one in sources).
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

  if (!Parse.User.current()) {
    await contentscriptReady;
    let browserPrint = localStorage.getItem("browserFingerPrint");
    if (!browserPrint) {
      browserPrint = await getFingerprintFromContentScript();
      if (browserPrint) {
        localStorage.setItem("browserFingerPrint", browserPrint);
        signupToParse(browserPrint);
      }
    } else {
      try {
        await loginToParse(browserPrint);
      } catch (err) {
        let signUpResult = await signupToParse(browserPrint);
        console.log(signUpResult);
      }
    }
  } else {
    // Might be a good idea to verify logged in user against the actual server here.
    // Because the current() function just checks if there is a user in localstorage and fetches it.
    // It thus relies on the parse server still having the session token saved.
    // But for now. Let's just assume all is good :-D
    loggedInToParse = true;
  }
};

const sendMessageToPage = async (type, msg) => {
  console.log("skickar till page:", type, msg);
  return browser.tabs
    .query({ currentWindow: true, active: true })
    .then(tabs => {
      console.log(tabs);
      return browser.tabs
        .sendMessage(tabs[0].id, {
          type: type,
          payload: msg
        })
        .then(answer => {
          console.log("sent message resolved: ", answer);
          return answer;
        })
        .catch(err => {
          console.error("sendMessage threw error:");
          console.error(err);
        });
    })
    .catch(err => {
      console.error("Probably didn't find any active tab to send to");
      console.error(err);
    });
};

browser.runtime.onMessage.addListener(async message => {
  console.log("message received: ", message);
  switch (message.type) {
    case "stateRequest":
      let state = JSON.parse(localStorage.getItem("state"));

      if (state) {
        console.log(state);
        return state;
      } else {
        console.error("couldn't retrieve a state from localStorage!");
        return Promise.reject("couldn't retrieve a state from localStorage!");
      }
    case "contentscriptReady":
      console.log("got contentscriptReady msg!");
      resolveContentscriptReady();
      return "ack for content script ready";
    case "userInteraction":
      return recordUserInteraction(message.payload);
    default:
      console.log("unknown message type");
      return "unknown message type";
  }
});

const recordUserInteraction = async payload => {
  if (!loggedInToParse) {
    return; //BAIL OUT MADDAFAKKA!!!!
  }
  console.log("received user interaction: ", payload);
  const UserInteraction = Parse.Object.extend("UserInteraction");
  const interaction = new UserInteraction();

  interaction.set("user", Parse.User.current());
  interaction.set("when", new Date());
  interaction.set("eventType", payload.eventType);
  interaction.set("eventData", payload.eventData);
  console.log("userInteraction!!!!", interaction);
  return interaction.save();
};

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

    return response.json();
  }
};

const initializeState = async facebookCssSelectors => {
  console.log("initialState is: ", initialState);
  initialState.facebookCssSelectors = facebookCssSelectors;
  // const initialState = {
  //   stateBreakingChangeCounter: 1,
  //   thingsToHide: [
  //     {
  //       sectionName: "Menyalternativ",
  //       options: [
  //         {
  //           id: "feed",
  //           name: "Flöde",
  //           cssSelectorName: "navItemNewsFeed",
  //           hide: false
  //         },
  //         {
  //           id: "messages",
  //           name: "Meddelanden",
  //           cssSelectorName: "navItemMessenger",
  //           hide: false
  //         },

  //         {
  //           id: "watch",
  //           name: "Titta",
  //           cssSelectorName: "navItemWatch",
  //           hide: false
  //         },

  //         {
  //           id: "marketplace",
  //           name: "Köp/Sälj",
  //           cssSelectorName: "navItemMarketplace",
  //           hide: false
  //         }
  //       ]
  //     },
  //     {
  //       sectionName: "Övrigt",
  //       options: [
  //         {
  //           id: "stories",
  //           name: "Händelser",
  //           cssSelectorName: "stories",
  //           hide: true
  //         },
  //         {
  //           id: "rpane",
  //           name: "Högerpanel",
  //           cssSelectorName: "rightPanel",
  //           hide: true
  //         }
  //         // {
  //         //   id: "language",
  //         //   name: "Språkruta",
  //         //   cssSelectorName: "languagePanel",
  //         //   hide: false
  //         // }
  //       ]
  //     }
  //   ],
  //   customCss: [
  //     {
  //       enabled: false,
  //       id: "zoom",
  //       name: "Zoom",
  //       selector: "body",
  //       property: "zoom",
  //       unit: "%",
  //       value: 100,
  //       min: 50,
  //       max: 200
  //     }
  //     // {
  //     //   enabled: false,
  //     //   id: "paragraphsize",
  //     //   name: "Brödtext textstorlek",
  //     //   selector: "p",
  //     //   property: "font-size",
  //     //   unit: "px",
  //     //   value: 19,
  //     //   min: 10,
  //     //   max: 40
  //     // },
  //     // {
  //     //   enabled: false,
  //     //   id: "textsize",
  //     //   name: "Övergripande textstorlek",
  //     //   selector: "body",
  //     //   property: "font-size",
  //     //   unit: "%",
  //     //   value: 100,
  //     //   min: 60,
  //     //   max: 240
  //     // }
  //   ],
  //   audienceSettings: {
  //     replaceAudienceIconsWithText: true,
  //     highlightAudienceWhenPosting: true
  //   },
  //   facebookCssSelectors: facebookCssSelectors
  // };

  let receivedState = JSON.parse(localStorage.getItem("state"));
  if (receivedState) {
    console.log(
      "previously saved state received from localStorage",
      receivedState
    );
    //Always replace the facebookCssSelectors no matter what.
    if (receivedState.facebookCssSelectors) {
      receivedState.facebookCssSelectors = facebookCssSelectors;
    } else {
      console.error(
        "no facebookCssSelectors key in received state. Creating one!!"
      );
      receivedState["facebookCssSelectors"] = facebookCssSelectors;
    }
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
