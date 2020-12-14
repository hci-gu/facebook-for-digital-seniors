import React from 'react'
import steps from '../steps.json'
import constants from './constants'
import reducer from './reducer'
import questionnaireReducer from './questionnaire/reducer'
import { initialState as initialQuestionnaireState } from './questionnaire'

export const actions = constants.actions

export const StateContext = React.createContext({})

export const StateConsumer = ({ children }) => {
  return <StateContext.Consumer>{children}</StateContext.Consumer>
}

const initialState = () => ({
  altMode: false,
  completed: false,
  removing: false,
  selectors: [],
  help: null,
  contact: {
    email: '',
    age: '',
    sex: '',
  },
  steps: steps.map(step => ({
    ...step,
    selectedValues: step.subSteps ? step.subSteps.map(_ => null) : [],
  })),
  index: 0,
  showInstalledInfo: false,
  highlightFeature: null,
  selectedValues: steps.map(_ => null),
})

export default class StateProvider extends React.Component {
  constructor(props) {
    super(props)

    if (props.questionnaire) {
      this.state = {
        ...initialQuestionnaireState(),
        dispatch: action => {
          this.setState(questionnaireReducer(this.state, action))
        },
      }
      return
    }

    this.state = {
      ...initialState(),
      dispatch: action => {
        this.setState(reducer(this.state, action))
      },
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
