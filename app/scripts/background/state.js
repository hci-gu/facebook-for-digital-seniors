import stateSchema from '../stateSchema.js'

const initialize = async facebookCssSelectors => {
  console.log('stateSchema is: ', stateSchema)
  stateSchema.facebookCssSelectors = facebookCssSelectors

  if (localStorage.getItem('enabled') === null) {
    toggleEnabled()
  }

  let storedState = get()
  let state = storedState ? storedState : Object.assign({}, stateSchema)
  state.facebookCssSelectors = facebookCssSelectors

  if (
    !hasSameProperties(state, stateSchema) ||
    !hasSameProperties(stateSchema, state) ||
    stateChangeCounterUpdated(state, stateSchema)
  ) {
    set(stateSchema)
  } else {
    set(state)
  }
}

const reset = () => set(Object.assign({}, stateSchema))

const get = () => {
  if (!getEnabled()) {
    console.log('state disabled, return default')
    return Object.assign({}, stateSchema)
  }

  try {
    return JSON.parse(localStorage.getItem('state'))
  } catch (err) {
    console.error(err)
    console.error('error when trying to fetch state from storage')
    return null
  }
}

const set = state => {
  if (!getEnabled()) {
    console.error("You probably don't want to set state while disabled")
    return
  }
  localStorage.setItem('state', JSON.stringify(state))
}

const toggleEnabled = () => {
  console.log('toggling enabled', getEnabled())
  localStorage.setItem('enabled', !getEnabled())
}

const getEnabled = () => {
  return localStorage.getItem('enabled') === 'true'
}

function stateChangeCounterUpdated(firstState, secondState) {
  if (
    !firstState.stateBreakingChangeCounter ||
    !secondState.stateBreakingChangeCounter
  ) {
    return true
  }
  return (
    firstState.stateBreakingChangeCounter !==
    secondState.stateBreakingChangeCounter
  )
}

function hasSameProperties(obj1, obj2) {
  try {
    return Object.keys(obj1).every(function(property) {
      if (typeof obj1[property] !== 'object') {
        return obj2.hasOwnProperty(property)
      } else {
        if (!obj2.hasOwnProperty(property)) {
          return false
        }
        return hasSameProperties(obj1[property], obj2[property])
      }
    })
  } catch (e) {
    //If bug. fallback to consider the comparison not equal.
    console.error('some bug in the hasSameProperties function')
    console.error(e)
    return false
  }
}

export default {
  initialize,
  get,
  set,
  reset,
  getEnabled,
  toggleEnabled,
}
