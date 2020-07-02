import Parse, { isEncryptedUserEnabled } from 'parse';
import Fingerprint2 from 'fingerprintjs2';

Parse.serverURL = 'https://d2sy394i9mrp8i.cloudfront.net/parse'; // This is your Server URL
Parse.initialize(
  process.env.PARSE_APP_KEY, // This is your Application ID
);
let loggedInToParse = false;

const setupParseConnection = async (browserPrint, contact) => {
  if (!Parse.User.current()) {
    console.log('no logged in parse user found. Gonna try to login/signup');
    try {
      await loginToParse(browserPrint);
    } catch (err) {
      console.log('login failed, err', err)
      let signUpResult = await signupToParse(browserPrint, contact);
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

const signupToParse = async (browserHash, contact) => {
  let credentials = generateCredentials(browserHash);
  try {
    let user = await Parse.User.signUp(
      credentials.username,
      credentials.password
    )
  
    if (user) {
      console.log('registered new parse user: ', user);
      user.set('contactEmail', contact.email);
      user.set('contactAge', contact.age);
      user.set('contactSex', contact.sex);
      user.save();
      loggedInToParse = true;
      return user;
    }
  } catch(err) {
    console.error('parse signup failed', err)
  }
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
  console.log('credentials', credentials)
  user = await Parse.User.logIn(credentials.username, credentials.password);
  console.log('user', user)

  if (user) {
    loggedInToParse = true;
    return user;
  }

  return Promise.reject('failed to login. NOW CRYYY!');
};

const sendUserInteraction = async (payload, state) => {
  if (!loggedInToParse) return;
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

const updateUserSettings = async (state) => {
  if (!loggedInToParse) return;
  console.log('updateUserSettings', state);
  
  const UserSettings = Parse.Object.extend('UserSettings');
  const query = new Parse.Query(UserSettings);
  query.equalTo('user', Parse.User.current());
  const result = await query.find();
  let userSettings;
  if (result.length > 0) {
    userSettings = result[0];
  } else {
    userSettings = new UserSettings();
    userSettings.set('user', Parse.User.current());
  }
  userSettings.set('settings', state);
  userSettings.save();
}

export default {
  setupParseConnection,
  sendUserInteraction,
  updateUserSettings
};
