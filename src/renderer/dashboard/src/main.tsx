import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store'
import './index.css'

async function bootstrap() {
  // Seed local cache from main before first render — no flash
  const initial = await window.api.getState()
  useStore.setState(initial)

  // Keep cache in sync with all future changes from main
  window.api.onStateChanged((state) => useStore.setState(state))

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap()
