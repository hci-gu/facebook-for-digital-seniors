import MutationSummary from 'mutation-summary'
import Fingerprint2 from 'fingerprintjs2'
import DOMUtils from './contentscript/DOM-utils'
import showWizard, {
  showWizardAfterDomLoaded,
  showQuestionnaireAfterDomLoaded,
} from '../components/wizard'
import messageUtils from './message-utils'

const wait = time => new Promise(resolve => setTimeout(() => resolve(), time))

const getFingerprint = () => {
  const calculateFingerprint = async () => {
    let components = await Fingerprint2.getPromise()
    var values = components.map(function(component) {
      return component.value
    })
    var murmur = Fingerprint2.x64hash128(values.join(''), 31)
    console.log('fingerPRINT: ', murmur)

    return murmur
  }

  return new Promise((resolve, reject) => {
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        resolve(calculateFingerprint())
      })
    } else {
      setTimeout(() => {
        resolve(calculateFingerprint())
      }, 500)
    }
  })
}

let backgroundPort = chrome.runtime.connect({
  name: 'port-from-contentscript',
})
backgroundPort.postMessageWithAck = messageUtils.postMessageWithAck
messageUtils.addMessageHandlerWithAckAsPromise(backgroundPort, message => {
  // console.log('msg received:', message);
  switch (message.type) {
    case 'getFingerPrint':
      console.log('fingerprint requested from other extension script')
      // return Promise.resolve("got your request maddafaka");
      return getFingerprint()
    case 'stateUpdate':
      try {
        console.log('state update received')
        const state = message.payload
        updateVisibilityAll(state)
        updateComposerAudience(state)
      } catch (err) {
        console.error(err)
        return 'stateUpdate failed somewhere in contentscript'
      }
      return 'performed your stateUpdate. Thaaaanx!!!'
    case 'redoIntro':
      return showWizardAfterDomLoaded()
    case 'debug':
      return debug()
    default:
      console.log('unknown message type', message)
      return 'unknown message type'
  }
})

const sendUserInteraction = payload => {
  backgroundPort.postMessage({ type: 'userInteraction', payload: payload })
}

const sendStateRequest = () =>
  backgroundPort.postMessageWithAck({ type: 'stateRequest', payload: null })

console.log('Sending contentScriptReady to bgscript')

backgroundPort
  .postMessageWithAck({ type: 'contentscriptReady', payload: null })
  .then(response => {
    console.log('contentScriptReady response from bgscript: ', response)
    sendUserInteraction({ eventType: 'refresh' })
  })

const getState = async (retries = 3) => {
  try {
    const state = await backgroundPort.postMessageWithAck({
      type: 'refreshState',
    })
    return state
  } catch (e) {}
  if (retries > 0) {
    await wait(500 * 3 - retries)
    return getState(retries - 1)
  }
}

const checkAndShowWizard = async () => {
  const wizardCompleted = await backgroundPort.postMessageWithAck({
    type: 'wizardCompleted',
  })

  if (!wizardCompleted) {
    showWizard()
  }
}

//INIT stuff is happening here
const init = async () => {
  console.log('init')
  const state = await getState()
  checkAndShowWizard()

  console.log('response received: ', state)
  // state = response;
  let selectors = state.facebookCssSelectors
  DOMUtils.init(selectors)

  if (!state.thingsToHide) {
    console.error('thingsToHide is null or undefined')
    return
  } else {
    console.log('state is: ', state)
  }

  let bodyLoaded = new MutationSummary({
    callback: () => {
      onBodyTagLoaded(state)
      bodyLoaded.disconnect()
    },
    queries: [{ element: 'body' }],
  })
  setTimeout(() => onBodyTagLoaded(state), 300)
}

const nodeChangeHandler = async () => {
  console.log('node summary was triggered')
  const state = await sendStateRequest()
  updateVisibilityAll(state)
  updateComposerAudience(state)
  updateVisibilityAll(state)
}

const updateVisibilityAll = state => {
  if (!state.thingsToHide) {
    console.error('thingsToHide is null or undefined')
    return
  }
  try {
    for (let category of state.thingsToHide) {
      if (category.groups) {
        for (let group of category.groups) {
          if (group.option) {
            DOMUtils.updateVisibilityFromShowHideObject(group.option)
          }
          if (group.options) {
            for (let option of group.options) {
              DOMUtils.updateVisibilityFromShowHideObject(option)
            }
          }
        }
      }
      if (category.options) {
        for (let option of category.options) {
          DOMUtils.updateVisibilityFromShowHideObject(option)
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const updateComposerAudience = state => {
  let element = DOMUtils.getNodeFromCssObject(
    state.facebookCssSelectors.composerAudienceButton
  )
  if (!element) return
  if (state.audienceSettings.highlightAudienceWhenPosting) {
    element.classList.add('red-highlight-border')
  } else {
    element.classList.remove('red-highlight-border')
  }
}

const checkIfQuestionnaireShouldDisplay = async () => {
  try {
    const showQuestionnaire = await backgroundPort.postMessageWithAck({
      type: 'shouldDisplayQuestionnaire',
    })
    if (showQuestionnaire) {
      showQuestionnaireAfterDomLoaded()
    }
  } catch (e) {}
}

let addedObservers = false
const onBodyTagLoaded = async state => {
  DOMUtils.createStyleTag()
  console.log('body tag added to DOM')
  const selectors = state.facebookCssSelectors

  const setupObservers = () => {
    updateVisibilityAll(state)
    setTimeout(() => updateVisibilityAll(state), 500)

    if (!addedObservers) {
      const watchedNodesQuery = [
        {
          element: 'form[method="POST"]',
        },
        {
          element: 'div[data-pagelet="root"]',
        },
        {
          element: 'div[data-testid="Keycommand_wrapper_ModalLayer"]',
        },
        {
          element: 'div[role="menu"]',
        },
      ]

      let leftPanelObserver = new MutationObserver(nodeChangeHandler)
      leftPanelObserver.observe(
        DOMUtils.getNodeFromCssObject(selectors.leftPanelExplore),
        { childList: true }
      )

      new MutationSummary({
        callback: nodeChangeHandler,
        queries: watchedNodesQuery,
      })
      addedObservers = true
    }
  }

  let interval = setInterval(() => {
    const node = DOMUtils.getNodeFromCssObject(selectors.leftPanel)
    if (node) {
      console.log('NODE FOUND ADD OBSERVERS')
      setupObservers()
      setTimeout(() => {
        checkIfQuestionnaireShouldDisplay()
      }, 1000)
      clearInterval(interval)
    } else {
      console.log('keep looking')
    }
  }, 100)
}

const debug = async () => {
  // const node = DOMUtils.getNodeForText('Dölj annons', 4)
  // const state = await sendStateRequest()
  nodeChangeHandler()
}

init()
