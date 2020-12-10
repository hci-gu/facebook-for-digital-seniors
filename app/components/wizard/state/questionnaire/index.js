import steps from '../../questions'

export const initialState = () => ({
  completed: false,
  removing: false,
  selectors: [],
  help: null,
  freeform: '',
  steps: steps.map(step => ({
    ...step,
    selectedValues: step.subSteps ? step.subSteps.map(_ => null) : [],
  })),
  index: 0,
  selectedValues: steps.map(_ => null),
})
