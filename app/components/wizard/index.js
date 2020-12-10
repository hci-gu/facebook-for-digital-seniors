import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import Questionnaire from './components/Questionnaire'
import StateProvider from './state'

export default () => {
  document.addEventListener('DOMContentLoaded', () => {
    const app = document.createElement('div')
    app.id = 'extension-root'
    document.body.appendChild(app)
    ReactDOM.render(
      <React.StrictMode>
        <StateProvider>
          <App />
        </StateProvider>
      </React.StrictMode>,
      app
    )
  })
}

export const showWizardAfterDomLoaded = () => {
  const app = document.createElement('div')
  app.id = 'extension-root'
  document.body.appendChild(app)
  ReactDOM.render(
    <React.StrictMode>
      <StateProvider>
        <App />
      </StateProvider>
    </React.StrictMode>,
    app
  )
}

export const showQuestionnaireAfterDomLoaded = () => {
  const app = document.createElement('div')
  app.id = 'extension-root'
  document.body.appendChild(app)
  ReactDOM.render(
    <React.StrictMode>
      <StateProvider questionnaire>
        <Questionnaire />
      </StateProvider>
    </React.StrictMode>,
    app
  )
}
