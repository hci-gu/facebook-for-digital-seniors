import MutationSummary from 'mutation-summary'
import Fingerprint2 from 'fingerprintjs2'
import DOMUtils from './contentscript/DOM-utils'
import showWizard, {
  showWizardAfterDomLoaded,
  showQuestionnaireAfterDomLoaded,
} from '../components/wizard'
import messageUtils from './message-utils'
// import { isPromiseResolved } from "promise-status-async";

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

let backgroundPort = browser.runtime.connect({
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
      return showQuestionnaireAfterDomLoaded()
    // return showWizardAfterDomLoaded()
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

const sendStateUpdate = state => {
  console.log('sending state to bg: ', state)
  backgroundPort.postMessage({ type: 'stateUpdate', payload: state })
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

//INIT stuff is happening here
const init = async () => {
  console.log('init')
  const state = await backgroundPort.postMessageWithAck({
    type: 'refreshState',
  })
  const wizardCompleted = await backgroundPort.postMessageWithAck({
    type: 'wizardCompleted',
  })

  if (!wizardCompleted) {
    showWizard()
  }
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
}

const nodeChangeHandler = async () => {
  console.log('node summary was triggered')
  const state = await sendStateRequest()
  updateVisibilityAll(state)
  updateComposerAudience(state)
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

const onBodyTagLoaded = async state => {
  DOMUtils.createStyleTag()
  console.log('body tag added to DOM')
  const selectors = state.facebookCssSelectors

  const setupObservers = () => {
    updateVisibilityAll(state)

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
    // const initialNodeObserver = new MutationSummary({
    //   callback: () => {
    //     nodeChangeHandler()
    //     initialNodeObserver.disconnect()
    //   },
    //   queries: [{ element: selectors.composerToolbar.selector }],
    // })

    let leftPanelObserver = new MutationObserver(nodeChangeHandler)
    leftPanelObserver.observe(
      DOMUtils.getNodeFromCssObject(selectors.leftPanelExplore),
      { childList: true }
    )

    console.log('watchedNodes: ', watchedNodesQuery)
    new MutationSummary({
      callback: nodeChangeHandler,
      queries: watchedNodesQuery,
    })
  }

  let interval = setInterval(() => {
    const node = DOMUtils.getNodeFromCssObject(selectors.leftPanel)
    if (node) {
      setupObservers()
      clearInterval(interval)
    }
  }, 100)
}

const debug = async () => {
  // const node = DOMUtils.getNodeForText('Dölj annons', 4)
  // const state = await sendStateRequest()
  nodeChangeHandler()
}

init()
