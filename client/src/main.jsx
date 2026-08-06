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

// Global interceptor for deactivated accounts
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.message === 'Your account has been deactivated.') {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            window.location.href = '/login?session=expired';
        }
        return Promise.reject(error);
    }
);

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
)
