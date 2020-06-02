import React from 'react'
import steps from './steps.json'
// import selectors, { hide, listenForChanges } from './selectors'

export const actions = {
  EXIT: 'exit',
  DONE: 'done',
  FORWARD: 'forward',
  BACKWARD: 'backward',
  JUMP_TO: 'jump-to',
  SELECTION: 'selection',
  CHECK: 'check',
}

export const StateContext = React.createContext({})

export const StateConsumer = ({ children }) => {
  return <StateContext.Consumer>{children}</StateContext.Consumer>
}

const selectorsForStep = (step, index) => {
  if (index === step.selections.length - 1) return []
  return step.selections
    .filter((_, i) => i <= index)
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
    return Object.keys(selectors)
  } else if (stepIndex === 1) {
    return []
  }

  const featuresToAddBack = selectorsForStep(step, value)

  return featuresToRemove.filter((val) => !featuresToAddBack.includes(val))
}

const removeFeaturesBasedOnSelections = (state) => {
  let featuresToRemove = Object.keys(selectors)
  state.selectedValues.forEach((s, i) => {
    if (i === 0 || i === state.selectedValues.length - 1) return
    featuresToRemove = selectorsForChoice(featuresToRemove, i, s)
  })
  return featuresToRemove
}

const removeFeaturesBasedOnCheckboxes = (state) => {
  const checkboxes = state.steps.reduce((_checkboxes, step) => {
    return _checkboxes.concat(step.checkboxes ? step.checkboxes : [])
  }, [])

  let featuresToRemove = Object.keys(selectors)

  checkboxes.forEach((checkbox) => {
    if (checkbox.value) {
      featuresToRemove = featuresToRemove.filter(
        (val) => !checkbox.add.includes(val)
      )
    }
  })

  return featuresToRemove
}

const reducer = (state, { action, payload }) => {
  switch (action) {
    case actions.DONE:
      console.log(state.selectedValues)
      let featuresToRemove
      featuresToRemove = state.altMode
        ? removeFeaturesBasedOnCheckboxes(state)
        : removeFeaturesBasedOnSelections(state)
      featuresToRemove.forEach((key, i) => {
        setTimeout(() => {
          hide(selectors[key]())
        }, 100 * i)
      })
      setTimeout(() => {
        listenForChanges(featuresToRemove)
      }, featuresToRemove * 200)
      return {
        ...state,
        removing: true,
      }
    case actions.EXIT:
      return {
        ...state,
        completed: true,
        removing: false,
      }
    case actions.SELECTION:
      return {
        ...state,
        selectedValues: state.selectedValues.map((s, i) => {
          if (i === payload.index) {
            s = payload.value
          }
          return s
        }),
      }
    case actions.CHECK:
      return {
        ...state,
        steps: state.steps.map((step, stepIndex) => {
          if (state.index !== stepIndex) return step
          return {
            ...step,
            checkboxes: step.checkboxes
              ? step.checkboxes.map((checkbox, i) => ({
                  ...checkbox,
                  value: payload.index === i ? !checkbox.value : checkbox.value,
                }))
              : null,
          }
        }),
      }
    case actions.FORWARD:
      if (state.index === steps.length - 1) return
      if (state.selectedValues[1] === 0) {
        return reducer(state, {
          action: actions.JUMP_TO,
          payload: { index: steps.length - 1 },
        })
      }
      return {
        ...state,
        index: state.index + 1,
      }
    case actions.BACKWARD:
      if (state.selectedValues[1] === 0) {
        return reducer(state, {
          action: actions.JUMP_TO,
          payload: { index: 1 },
        })
      }
      if (state.index === 0) return
      return {
        ...state,
        index: state.index - 1,
      }
    case actions.JUMP_TO:
      return {
        ...state,
        index: payload.index,
      }
    default:
      return {
        ...state,
        ...payload,
      }
  }
}

const initialState = () => ({
  altMode: false,
  completed: false,
  removing: false,
  selectors: [],
  steps: steps.map((step) => ({
    ...step,
    checkboxes: step.checkboxes
      ? step.checkboxes.map((checkbox) => ({
          ...checkbox,
          value: false,
        }))
      : null,
  })),
  index: 0,
  selectedValues: steps.map((_) => null),
})

export default class StateProvider extends React.Component {
  state = {
    ...initialState(),
    dispatch: (action) => {
      this.setState(reducer(this.state, action))
    },
  }

  componentDidMount() {
    document.onkeypress = (e) => {
      if (e.key === 'z') {
        this.state.dispatch({
          payload: {
            altMode: !this.state.altMode,
          },
        })
      }
    }
  }

  render() {
    return (
      <StateContext.Provider value={this.state}>
        {this.props.children}
      </StateContext.Provider>
    )
  }
}
