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

  set(state)
}

const reset = () => set(Object.assign({}, stateSchema))

const get = () => {
  if (!getEnabled()) {
    console.log('state disabled, return default')
    return Object.assign({}, stateSchema, { globalToggle: false })
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

export default {
  initialize,
  get,
  set,
  reset,
  getEnabled,
  toggleEnabled,
}
