import { API_URL } from '../config/api';

/**
 * Enhanced fetch that automatically adds the staff token to headers.
 */
export const secureFetch = async (url, options = {}) => {
    const token = localStorage.getItem('staff_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        // Token might be expired or invalid, clear and redirect to login
        localStorage.removeItem('staff');
        localStorage.removeItem('staff_token');
        if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
        }
    }

    return response;
};
