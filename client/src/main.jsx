import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import './performance.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'

// Configure axios base URL for entire app
// Uses VITE_API_URL env var, or defaults to same-origin (handled by Nginx proxy)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
