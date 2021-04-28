import showWizard, { showWizardAfterDomLoaded } from '../components/wizard'

if (!chrome.runtime) {
  showWizard()
}
