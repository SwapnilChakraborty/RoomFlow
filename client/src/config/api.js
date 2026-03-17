/**
 * Central API configuration to avoid hardcoding the production URL everywhere.
 * If VITE_API_URL is not set in .env, it defaults to the production Render URL.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'https://hotel-mangment-1.onrender.com';

console.log('API_URL initialized as:', API_URL);

if (!import.meta.env.VITE_API_URL) {
    console.warn('VITE_API_URL is not set. Falling back to production:', API_URL);
}
