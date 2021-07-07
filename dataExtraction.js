require('dotenv').config()

const { Parser } = require('json2csv')
const Parse = require('parse/node')
const fs = require('fs')

Parse.serverURL = 'https://analytics.digitalaseniorer.org/parse'
const csvParserOpts = {
  fields: [
    'createdAt',
    'gender',
    'age',
    'email',
    'browser',
    'latestInteraction',
    'extensionActive',
    'wizardAnswerDate',
    'wizardAnswers',
    'questionnaireAnswerDate',
    'questionnaireAnswers',
    'questionnaireComments',
  ],
}

const questionnaireAnswersForUser = async user => {
  const QuestionnaireAnswers = Parse.Object.extend('QuestionnaireAnswers')
  const query = new Parse.Query(QuestionnaireAnswers)
  query.equalTo('user', user)
  const result = await query.find()
  if (result[0]) {
    return {
      questionnaireAnswerDate: result[0].get('date'),
      questionnaireAnswers: result[0].get('answers').join(','),
      questionnaireComments: result[0].get('comments'),
    }
  }
  return {}
}

const wizardAnswersForUser = async user => {
  const WizardAnswers = Parse.Object.extend('WizardAnswers')
  const query = new Parse.Query(WizardAnswers)
  query.equalTo('user', user)
  const result = await query.find()
  if (result[0]) {
    return {
      wizardAnswerDate: result[0].get('date'),
      wizardAnswers: result[0].get('answers').join(','),
    }
  }
  return {}
}

const interactionsForUser = async user => {
  const UserInteraction = Parse.Object.extend('UserInteraction')
  const query = new Parse.Query(UserInteraction)
  query.equalTo('user', user)
  query.limit(500)
  query.ascending('createdAt')
  const result = await query.find()
  // console.log({ result })
  const interactions = result.reduce((acc, curr) => {
    const type = curr.get('eventType')
    if (!acc[type]) {
      acc[type] = {
        count: 1,
      }
    } else {
      acc[type].count++
    }

    return acc
  }, {})

  const latestInteraction = result[result.length - 1]
    ? result[result.length - 1]
    : null

  return {
    interactions,
    latestInteraction: latestInteraction
      ? latestInteraction.get('createdAt')
      : null,
    extensionActive: latestInteraction
      ? latestInteraction.get('extensionActive')
      : false,
  }
}

const getUserData = async u => {
  return {
    createdAt: u.get('createdAt'),
    email: u.get('contactEmail'),
    age: u.get('contactAge'),
    gender: u.get('contactSex'),
    browser: u.get('vendor'),
    ...(await interactionsForUser(u)),
    ...(await wizardAnswersForUser(u)),
    ...(await questionnaireAnswersForUser(u)),
  }
}

const run = async () => {
  await Parse.initialize(
    process.env.PARSE_APP_KEY,
    null,
    process.env.PARSE_MASTER_KEY
  )
  Parse.Cloud.useMasterKey()

  const User = Parse.Object.extend('User')
  const query = new Parse.Query(User)
  const result = await query.find()

  const users = await Promise.all(result.map(u => getUserData(u)))
  // console.log({ result })
  console.log(JSON.stringify(users, null, 2))

  const parser = new Parser(csvParserOpts)
  const csv = parser.parse(users)
  fs.writeFileSync('./out.csv', csv)
  console.log('done')
}

run()
