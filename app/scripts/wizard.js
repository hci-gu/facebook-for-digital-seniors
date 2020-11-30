import showWizard, { showWizardAfterDomLoaded } from '../components/wizard'

if (!browser.runtime) {
  showWizard()
}