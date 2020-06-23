import Parse from 'parse';
import Fingerprint2 from 'fingerprintjs2';

Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
Parse.initialize(
  process.env.PARSE_APP_KEY, // This is your Application ID
  process.env.PARSE_JAVASCRIPT_KEY // This is your Javascript key
);
let loggedInToParse = false;

const setupParseConnection = async (browserPrint) => {
  if (!Parse.User.current()) {
    console.log('no logged in parse user found. Gonna try to login/signup');
    try {
      await loginToParse(browserPrint);
    } catch (err) {
      let signUpResult = await signupToParse(browserPrint);
      console.log(signUpResult);
    }
  } else {
    // Might be a good idea to verify logged in user against the actual server here.
    // Because the current() function just checks if there is a user in localstorage and fetches it.
    // It thus relies on the parse server still having the session token saved.
    // But for now. Let's just assume all is good :-D
    console.log('Was already logged in to Parse (with sessiontoken)');
    loggedInToParse = true;
  }
};

const generateCredentials = (hash) => {
  return { username: Fingerprint2.x64hash128(hash), password: hash };
};

const signupToParse = async (browserHash) => {
  let credentials = generateCredentials(browserHash);
  let user = Parse.User.signUp(
    credentials.username,
    credentials.password
  ).catch((err) => console.error('parse signup failed', err));

  if (user) {
    console.log('registered new parse user: ', user);
    loggedInToParse = true;
    return user;
  }

  Promise.reject('failed to signUp new user. SAAAAD!');
};

const loginToParse = async (browserHash) => {
  let user;
  // user = Parse.User.current();
  // if (user) {
  //   loggedInToParse = true;
  //   return user;
  // }
  console.log('no current user. Trying to login');
  let credentials = generateCredentials(browserHash);
  user = await Parse.User.logIn(credentials.username, credentials.password);

  if (user) {
    loggedInToParse = true;
    return user;
  }

  return Promise.reject('failed to login. NOW CRYYY!');
};

const sendUserInteraction = async (payload, state) => {
  if (!loggedInToParse) {
    return; //BAIL OUT MADDAFAKKA!!!!
  }
  console.log('received user interaction: ', payload);
  const UserInteraction = Parse.Object.extend('UserInteraction');
  const interaction = new UserInteraction();

  interaction.set('user', Parse.User.current());
  interaction.set('when', new Date());
  interaction.set('eventType', payload.eventType);
  interaction.set('eventData', payload.eventData);

  //Gotta get extension state during this interaction
  if (state.globalToggle != undefined) {
    interaction.set('extensionActive', state.globalToggle);
  }

  console.log('userInteraction!!!!', interaction);
  return interaction.save();
};

export default {
  setupParseConnection,
  sendUserInteraction,
};
