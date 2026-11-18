import axios from 'axios';

// Get API URL from environment or use proxy fallback
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        // Unauthorized on a protected route - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const getAssetUrl = (relativeOrAbsoluteUrl) => {
  if (!relativeOrAbsoluteUrl) return null;
  if (relativeOrAbsoluteUrl.startsWith('http://') || relativeOrAbsoluteUrl.startsWith('https://')) {
    return relativeOrAbsoluteUrl;
  }
  const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrl = rawApiUrl.startsWith('http') ? rawApiUrl.replace(/\/api\/?$/, '') : '';
  const cleanPath = relativeOrAbsoluteUrl.replace(/^\/+/, '');
  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
};

export default apiClient;
