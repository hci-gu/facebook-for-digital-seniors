import Parse, { isEncryptedUserEnabled } from 'parse'
import Fingerprint2 from 'fingerprintjs2'

Parse.serverURL = 'https://analytics.digitalaseniorer.org/parse' // This is your Server URL
Parse.initialize(
  process.env.PARSE_APP_KEY // This is your Application ID
)
let loggedInToParse = false

const setupParseConnection = async (browserPrint, contact, vendor) => {
  if (!Parse.User.current() && getAnalyticsEnabled()) {
    console.log('no logged in parse user found. Gonna try to login/signup')
    try {
      await loginToParse(browserPrint)
    } catch (err) {
      console.log('login failed, err', err)
      let signUpResult = await signupToParse(browserPrint, contact, vendor)
      console.log(signUpResult)
    }
  } else if (getAnalyticsEnabled()) {
    // Might be a good idea to verify logged in user against the actual server here.
    // Because the current() function just checks if there is a user in localstorage and fetches it.
    // It thus relies on the parse server still having the session token saved.
    // But for now. Let's just assume all is good :-D
    console.log('Was already logged in to Parse (with sessiontoken)')
    loggedInToParse = true
  }
}

const generateCredentials = hash => {
  return { username: Fingerprint2.x64hash128(hash), password: hash }
}

const signupToParse = async (browserHash, contact, vendor) => {
  let credentials = generateCredentials(browserHash)
  try {
    let user = await Parse.User.signUp(
      credentials.username,
      credentials.password
    )
    let acl = new Parse.ACL(user)
    acl.setReadAccess(user, true)
    acl.setWriteAccess(user, true)
    user.setACL(acl)

    if (user) {
      console.log('registered new parse user: ', user)
      user.set('contactEmail', contact.email)
      user.set('contactAge', contact.age)
      user.set('vendor', vendor)
      if (process.env.NODE_ENV == 'development') {
        console.log('creating user as testUser')
        user.set('isTestUser', true)
      }
      user.set('contactSex', contact.sex)
      user.save()
      loggedInToParse = true
      return user
    }
  } catch (err) {
    console.error('parse signup failed', err)
  }
}

const loginToParse = async browserHash => {
  let credentials = generateCredentials(browserHash)
  const user = await Parse.User.logIn(
    credentials.username,
    credentials.password
  )

  if (user) {
    loggedInToParse = true
    return user
  }

  return Promise.reject('failed to login. NOW CRYYY!')
}

const setDefaultDocFields = (doc, user, write = false) => {
  let acl = new Parse.ACL(Parse.User.current())
  acl.setReadAccess(user, true)
  if (write) acl.setWriteAccess(user, true)
  doc.setACL(acl)
  doc.set('date', new Date())
  doc.set('user', Parse.User.current())
}

const sendUserInteraction = async (payload, state) => {
  if (!loggedInToParse) return
  const UserInteraction = Parse.Object.extend('UserInteraction')
  const interaction = new UserInteraction()
  setDefaultDocFields(interaction, Parse.User.current())

  interaction.set('eventType', payload.eventType)
  interaction.set('eventData', payload.eventData)
  interaction.set('userSettings', state)

  //Gotta get extension state during this interaction
  if (state.globalToggle != undefined) {
    interaction.set('extensionActive', state.globalToggle)
  }

  console.log('userInteraction!!!!', interaction)
  return interaction.save()
}

const updateUserSettings = async state => {
  if (!loggedInToParse) return
  console.log('updateUserSettings', state)

  const UserSettings = Parse.Object.extend('UserSettings')
  const query = new Parse.Query(UserSettings)
  query.equalTo('user', Parse.User.current())
  const result = await query.find()
  let userSettings
  if (result.length > 0) {
    userSettings = result[0]
  } else {
    userSettings = new UserSettings()
    setDefaultDocFields(userSettings, Parse.User.current(), true)
  }
  userSettings.set('settings', state)
  userSettings.save()
}

const fetchQuestionnairePeriod = async () => {
  if (!loggedInToParse) return
  try {
    const QuestionnaireSettings = Parse.Object.extend('questionnaireSettings')
    const query = new Parse.Query(QuestionnaireSettings)
    const result = await query.find()
    if (result && result.length > 0) {
      return result[0].attributes.showAgainAfterDays
    }
  } catch (e) {
    console.log(e)
  }
  return 7
}

const submitWizardAnswers = async answers => {
  const WizardAnswer = Parse.Object.extend('WizardAnswers')
  const wizardAnswer = new WizardAnswer()
  setDefaultDocFields(wizardAnswer, Parse.User.current())
  wizardAnswer.set('answers', answers)
  wizardAnswer.set('version', '1.0.0')

  return wizardAnswer.save()
}

const submitQuestionnaire = async ({ answers, comments }) => {
  const Answer = Parse.Object.extend('QuestionnaireAnswers')
  const answer = new Answer()
  setDefaultDocFields(answer, Parse.User.current())
  answer.set('answers', answers)
  answer.set('comments', comments)
  answer.set('version', '1.0.0')

  return answer.save()
}

const deleteAllForUser = async (table, user) => {
  const Table = Parse.Object.extend(table)
  const query = new Parse.Query(Table)
  const results = await query.find({ sessionToken: user.getSessionToken() })
  await Parse.Object.destroyAll(results)
}

const deleteData = async () => {
  const user = Parse.User.current()

  await deleteAllForUser('QuestionnaireAnswers', user)
  await deleteAllForUser('UserInteraction', user)
  await deleteAllForUser('UserSettings', user)
  await deleteAllForUser('WizardAnswers', user)

  user.set('contactEmail', null)
  user.set('contactAge', null)
  user.set('contactSex', null)
  await user.save()
  localStorage.setItem('analyticsActivated', false)
}

const getAnalyticsEnabled = () =>
  localStorage.getItem('analyticsActivated') === 'true'

const getUserId = () => {
  const user = Parse.User.current()
  if (!!user) {
    return user.attributes.username
  }
  return null
}

export default {
  setupParseConnection,
  sendUserInteraction,
  updateUserSettings,
  fetchQuestionnairePeriod,
  submitWizardAnswers,
  submitQuestionnaire,
  deleteData,
  getAnalyticsEnabled,
  signupToParse,
  getUserId,
}
