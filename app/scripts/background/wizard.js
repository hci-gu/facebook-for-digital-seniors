import state from './state'

const findOptionForId = (object, id, result) => {
  if (object.id === id) result.push(object)

  for (let i = 0; i < Object.keys(object).length; i++) {
    if (typeof object[Object.keys(object)[i]] == 'object') {
      findOptionForId(object[Object.keys(object)[i]], id, result)
    }
  }
}

const setHiddenForId = (state, id) => {
  const result = []
  findOptionForId(state, id, result)
  if (result[0]) {
    result[0].hide = true
  }
}

const updateStateHideOptionsForIds = (ids, state) =>
  ids.forEach(id => setHiddenForId(state, id))

const setCompleted = payload => {
  let analyticsActivated = false
  if (payload) {
    const _state = state.get()
    updateStateHideOptionsForIds(payload.featuresToRemove, _state)
    state.set(_state)
    localStorage.setItem('analyticsActivated', payload.analyticsActivated)
    analyticsActivated = payload.analyticsActivated
  }
  localStorage.setItem('wizardCompleted', true)
  return analyticsActivated
}

export default {
  setCompleted,
  isCompleted: () => localStorage.getItem('wizardCompleted') === 'true',
}
