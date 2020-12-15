import steps from '../../questions'

export const initialState = () => ({
  isQuestionnaire: true,
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
  showInstalledInfo: false,
  selectedValues: steps.map(_ => null),
})
