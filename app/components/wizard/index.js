import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
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