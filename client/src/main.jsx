import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import './performance.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'

// Configure axios base URL for entire app
// Hardcoded fallback ensures Vercel always reaches the Render backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://skilldad-server.onrender.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
