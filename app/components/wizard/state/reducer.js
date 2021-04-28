import { actions, selectors } from './constants'
import steps from '../steps.json'
let backgroundPort =
  chrome && chrome.runtime
    ? chrome.runtime.connect({ name: 'port-from-contentscript' })
    : null

const selectorsForStep = (step, index) => {
  if (step.subSteps)
    return step.subSteps.reduce((acc, subStep) => {
      return [...acc, ...selectorsForStep(subStep)]
    }, [])
  if (!step.selections) return []
  return step.selections
    .filter((_, i) => i >= index)
    .reduce((acc, curr) => {
      if (curr.add) {
        return [...acc, ...curr.add]
      }
      return acc
    }, [])
}

const selectorsForChoice = (featuresToRemove, stepIndex, value) => {
  const step = steps[stepIndex]

  if (stepIndex === 1 && value === 1) {
    return selectors
  } else if (stepIndex === 1) {
    return []
  }
  const featuresToAddBack = selectorsForStep(step, value)

  return featuresToRemove.filter(val => !featuresToAddBack.includes(val))
}

const removeFeaturesBasedOnSelections = state => {
  let featuresToRemove = selectors
  state.selectedValues.forEach((s, i) => {
    if (i <= 3 || i === state.selectedValues.length - 1) return
    featuresToRemove = selectorsForChoice(featuresToRemove, i, s)
  })
  return featuresToRemove
}

const goForward = state => {
  const step = state.steps[state.index]
  if (state.index === steps.length - 1) return
  if (step.subSteps && step.subStepIndex < step.subSteps.length - 1) {
    if (
      state.index === steps.length - 2 &&
      step.selectedValues[step.subStepIndex] > 0
    ) {
      return reducer(state, {
        action: actions.JUMP_TO,
        payload: { index: steps.length - 1 },
      })
    }
    step.subStepIndex++
    return reducer(state, {
      ...state,
    })
  }
  if (state.index === 1 && state.selectedValues[1] === 0) {
    return reducer(state, {
      action: actions.JUMP_TO,
      payload: { index: steps.length - 1 },
    })
  }
  return {
    ...state,
    help: null,
    index: state.index + 1,
    highlightFeature:
      state.index === 1 && state.highlightFeature === null ? true : null,
  }
}

const goBack = state => {
  const step = state.steps[state.index]
  if (step.subSteps && step.subStepIndex > 0) {
    step.subStepIndex--
    return reducer(state, {
      ...state,
    })
  }
  if (state.index === 2 && state.selectedValues[0] === 1) {
    return reducer(state, {
      action: actions.JUMP_TO,
      payload: { index: 0 },
    })
  }
  if (state.index === 3 && state.selectedValues[0] === 2) {
    return reducer(state, {
      action: actions.JUMP_TO,
      payload: { index: 0 },
    })
  }
  if (state.index === steps.length - 1 && state.selectedValues[1] === 0) {
    return reducer(state, {
      action: actions.JUMP_TO,
      payload: { index: 1 },
    })
  }
  if (state.index === 0) return
  return {
    ...state,
    help: null,
    index: state.index - 1,
  }
}

const reducer = (state, { action, payload }) => {
  switch (action) {
    case actions.DONE:
      const featuresToRemove = removeFeaturesBasedOnSelections(state)
      const answers = state.selectedValues.filter(v => v != null)
      backgroundPort.postMessage({
        type: 'setWizardCompleted',
        payload: {
          vendor: VENDOR_NAME,
          answers,
          featuresToRemove,
          analyticsActivated: !!state.contact.age,
          contact: !!state.contact.age ? state.contact : null,
        },
      })
      return {
        ...state,
        removing: true,
      }
    case actions.EXIT:
      backgroundPort.postMessage({
        type: 'setWizardCompleted',
        payload: {
          vendor: VENDOR_NAME,
          featuresToRemove: [],
          analyticsActivated: !!state.contact.age,
          contact: !!state.contact.age ? state.contact : null,
        },
      })
      return {
        ...state,
        completed: true,
        showInstalledInfo: true,
        removing: false,
      }
    case actions.ABORT:
      return {
        ...state,
        completed: true,
        showInstalledInfo: true,
        removing: false,
      }
    case actions.SELECTION:
      const step = state.steps[state.index]
      if (step.subSteps) {
        step.selectedValues = step.selectedValues.map((s, i) => {
          if (i === step.subStepIndex) {
            s = payload.value
          }
          return s
        })
        return {
          ...state,
        }
      }

      return {
        ...state,
        selectedValues: state.selectedValues.map((s, i) => {
          if (i === payload.index) {
            s = payload.value
          }
          return s
        }),
      }
    case actions.FORWARD:
      return goForward(state)
    case actions.BACKWARD:
      return goBack(state)
    case actions.JUMP_TO:
      return {
        ...state,
        index: payload.index,
      }
    case actions.HELP_PANEL:
      return {
        ...state,
        highlightFeature: false,
        help: payload,
      }
    case actions.CONTACT_EDIT:
      const contact = {
        ...state.contact,
      }
      contact[payload.type] = payload.value
      return {
        ...state,
        contact,
      }
    default:
      return {
        ...state,
        ...payload,
      }
  }
}

export default reducer
