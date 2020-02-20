import Parse from "parse";
import Fingerprint2 from "fingerprintjs2";
import stateSchema from "./stateSchema.js";
import { isPromiseResolved } from "promise-status-async";

Parse.serverURL = "https://parseapi.back4app.com"; // This is your Server URL
Parse.initialize(
  process.env.PARSE_APP_KEY, // This is your Application ID
  process.env.PARSE_JAVASCRIPT_KEY // This is your Javascript key
);
let loggedInToParse = false;
let initState = {};

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
    console.log("registered new parse user: ", user);
    loggedInToParse = true;
    return user;
  }

  Promise.reject("failed to signUp new user. SAAAAD!");
};

const loginToParse = async browserHash => {
  let user;
  // user = Parse.User.current();
  // if (user) {
  //   loggedInToParse = true;
  //   return user;
  // }
  console.log("no current user. Trying to login");
  let credentials = generateCredentials(browserHash);
  user = await Parse.User.logIn(credentials.username, credentials.password);

  if (user) {
    loggedInToParse = true;
    return user;
  }

  return Promise.reject("failed to login. NOW CRYYY!");
};

// browser.runtime.onInstalled.addListener(details => {
//   console.log("previousVersion", details.previousVersion);
// });

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
    console.error("no browserPrint was recevied: ", err);
    return Promise.reject(err);
  });
  console.log("got browserPrint from page: ", response);
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
    console.log("no logged in parse user found. Gonna try to login/signup");
    await contentscriptReady;
    console.log("contentscriptReady resolved");
    let browserPrint = localStorage.getItem("browserFingerPrint");
    if (!browserPrint) {
      console.log(
        "no browserprint saved in storage. Gonna ask the page for one"
      );
      browserPrint = await getFingerprintFromContentScript();
      if (browserPrint) {
        localStorage.setItem("browserFingerPrint", browserPrint);
        try {
          await loginToParse(browserPrint);
        } catch (err) {
          let signUpResult = await signupToParse(browserPrint);
          console.log(signUpResult);
        }
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
    console.log("Was already logged in to Parse (with sessiontoken)");
    loggedInToParse = true;
  }
};

const sendMessageToPopup = async (type, msg) => {
  return browser.runtime.sendMessage({ type: type, payload: msg });
  // .then(response => {
  //   console.log("sendStateUpdate response: ", response);
  // });
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
    case "stateUpdate":
      // let parsedStateObject = JSON.parse(message.payload);
      console.log("received state update from page", message.payload);
      localStorage.setItem("state", message.payload);
      // sendMessageToPopup("stateUpdate", message)
      //   .then(response => {
      //     console.log("response from sending state to popup: ", response);
      //   })
      //   .catch(err => {
      //     console.error(err);
      //     console.error("the popup is probably not open");
      //   });
      return "Aiight! Got your state!";
    case "initStateRequest":
      console.log("got initStateRequest from popup");
      return initState;
    case "contentscriptReady":
      console.log("got contentscriptReady msg!");
      resolveContentscriptReady();
      return "ack for contentscriptReady";
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

  //Gotta get extension state during this interaction
  let state = JSON.parse(localStorage.getItem("state"));
  if (state.globalToggle != undefined) {
    interaction.set("extensionActive", state.globalToggle);
  }

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
  console.log("stateSchema is: ", stateSchema);
  stateSchema.facebookCssSelectors = facebookCssSelectors;
  initState = Object.assign({}, stateSchema);

  let receivedState = null;
  try {
    receivedState = JSON.parse(localStorage.getItem("state"));
  } catch (err) {
    console.error(err);
    console.error("error when trying to fetch state from storage");
  }
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
      !hasSameProperties(receivedState, stateSchema) ||
      !hasSameProperties(stateSchema, receivedState) ||
      stateChangeCounterUpdated(receivedState, stateSchema)
    ) {
      console.log(
        "discrepency found in state from local storage. Fallback to using initial state from source code"
      );
      return stateSchema;
    }
    return receivedState;
  } else {
    console.log(
      "nothing in localStorage. using initial state from source code",
      stateSchema
    );
    return stateSchema;
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
    // console.log("comparison called on: ", obj1, obj2);
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
