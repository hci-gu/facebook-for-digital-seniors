import { actions } from '../constants'
import steps from '../../questions'
let backgroundPort =
  browser && browser.runtime
    ? browser.runtime.connect({ name: 'port-from-contentscript' })
    : null

const goForward = state => {
  const step = state.steps[state.index]
  if (state.index === steps.length - 1) return
  if (step.subSteps && step.subStepIndex < step.subSteps.length - 1) {
    step.subStepIndex++
    return reducer(state, {
      ...state,
    })
  }
  return {
    ...state,
    index: state.index + 1,
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
  return {
    ...state,
    index: state.index - 1,
  }
}

const reducer = (state, { action, payload }) => {
  switch (action) {
    case actions.DONE:
      const answers = state.selectedValues.filter(v => v != null)
      console.log({
        answers,
        comments: state.freeform,
      })
      backgroundPort.postMessage({
        type: 'questionnaireCompleted',
        payload: {
          answers,
          comments: state.freeform,
        },
      })
      return {
        ...state,
        completed: true,
      }
    case actions.EXIT:
    case actions.ABORT:
      backgroundPort.postMessage({
        type: 'questionnaireAborted',
        payload: {},
      })
      return {
        ...state,
        completed: true,
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
    case actions.HELP_PANEL:
      return {
        ...state,
        help: payload,
      }
    case actions.FREEFORM_EDIT:
      return {
        ...state,
        freeform: payload.value,
      }
    default:
      return {
        ...state,
        ...payload,
      }
  }
}

export default reducer
