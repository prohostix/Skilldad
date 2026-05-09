import axios from 'axios';

// Add a request interceptor to attach the auth token
axios.interceptors.request.use(
    (config) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const token = userInfo?.token || localStorage.getItem('token');
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('[Axios Request Interceptor] Error accessing auth data:', error.message);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Setup axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            console.log('[Axios Interceptor] 401 Unauthorized - Clearing auth data');
            
            // Clear localStorage
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            
            // Redirect to login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
