import axios from 'axios';

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
