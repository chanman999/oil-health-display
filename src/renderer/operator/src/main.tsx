import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store'
import './index.css'

async function bootstrap() {
  const initial = await window.api.getState()
  useStore.setState(initial)
  window.api.onStateChanged((state) => useStore.setState(state))

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap()
