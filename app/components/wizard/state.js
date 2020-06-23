import React from 'react'
import steps from './steps.json'
const selectors = [
  "universal-nav-item-3",
  "universal-nav-item-4",
  "create-post-panel-safety-just-me",
  "create-post-panel-safety-friends",
  "apps-nav-item-1",
  "apps-nav-item-2",
  "apps-nav-item-4",
  "apps-nav-item-5",
  "apps-nav-item-6",
  "apps-nav-item-7",
  "apps-nav-item-8",
  "apps-nav-item-9",
  "apps-nav-item-10",
  "apps-nav-item-13",
  "apps-nav-item-17",
  "apps-nav-item-18",
  "apps-nav-item-20",
  "post-settings-save",
  "post-settings-hide",
  "post-settings-hide-ad",
  "post-settings-notifications",
  "composer-tag-friends",
  "composer-check-in",
  "composer-add-pic",
  "composer-background-button",
  "composer-feeling",
  "composer-recommendation",
  "composer-gif",
  "composer-charity",
  "composer-live-stream",
  "create-post-more",
  "stories",
  "friends-recommended",
  "friends-games",
  "friends-games-popular"
]

export const actions = {
  EXIT: 'exit',
  DONE: 'done',
  FORWARD: 'forward',
  BACKWARD: 'backward',
  JUMP_TO: 'jump-to',
  SELECTION: 'selection',
  CHECK: 'check',
  HELP_PANEL: 'help-panel',
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
    return selectors
  } else if (stepIndex === 1) {
    return []
  }

  const featuresToAddBack = selectorsForStep(step, value)

  return featuresToRemove.filter((val) => !featuresToAddBack.includes(val))
}

const removeFeaturesBasedOnSelections = (state) => {
  let featuresToRemove = selectors
  state.selectedValues.forEach((s, i) => {
    if (i === 0 || i === state.selectedValues.length - 1) return
    featuresToRemove = selectorsForChoice(featuresToRemove, i, s)
  })
  return featuresToRemove
}

const reducer = (state, { action, payload }) => {
  switch (action) {
    case actions.DONE:
      console.log(state.selectedValues)
      let featuresToRemove
      featuresToRemove = removeFeaturesBasedOnSelections(state)
      console.log('featuresToRemove', featuresToRemove)
      browser.runtime.sendMessage({ type: 'setWizardCompleted', payload: featuresToRemove })
      return {
        ...state,
        removing: true,
      }
    case actions.EXIT:
      browser.runtime.sendMessage({ type: 'setWizardCompleted', payload: [] })
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
    case actions.HELP_PANEL:
      return {
        ...state,
        help: payload,
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
  help: null,
  steps: steps.map(step => ({
    ...step,
  })),
  index: 0,
  selectedValues: steps.map(_ => null),
})

export default class StateProvider extends React.Component {
  state = {
    ...initialState(),
    dispatch: action => {
      this.setState(reducer(this.state, action))
    },
  }

  render() {
    return (
      <StateContext.Provider value={this.state}>
        {this.props.children}
      </StateContext.Provider>
    )
  }
}
