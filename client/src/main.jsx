import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import './performance.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'

// Configure axios base URL for entire app
// In production or on any remote host, always use same-origin (handled by Nginx reverse proxy)
const envApi = import.meta.env.VITE_API_URL;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  axios.defaults.baseURL = '';
} else if (import.meta.env.PROD) {
  axios.defaults.baseURL = (envApi && !envApi.includes('localhost')) ? envApi : '';
} else {
  axios.defaults.baseURL = envApi || '';
}


createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
)
