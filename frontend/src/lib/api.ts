import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
  url?: string;
}

// Add custom properties to AxiosRequestConfig
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Add runtime check for API URL
if (!baseURL) {
  console.error('API URL is not configured. Please check your environment variables.');
}

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Function to handle retry delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  const baseDelay = 1000; // Base delay of 1 second
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Max delay of 10 seconds
};

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig;
    
    // Handle network errors with retry logic
    if (!error.response) {
      const retryCount = originalRequest.retryCount || 0;
      const maxRetries = originalRequest.maxRetries || 3;
      
      if (retryCount < maxRetries) {
        originalRequest.retryCount = retryCount + 1;
        const delay = getRetryDelay(retryCount);
        
        // Wait for the delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retrying request (${originalRequest.retryCount}/${maxRetries})`);
        return api(originalRequest);
      }
      
      return Promise.reject(new Error('Unable to connect to the server after multiple attempts. Please check your connection.'));
    }

    // Handle API error responses
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'An error occurred';
      
      if (status === 400) {
        return Promise.reject(new Error(errorMessage));
      }
    }

    if (error.response?.status === 401) {
      // Only attempt refresh if this is not already a refresh token request
      if (!originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;

        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            // No token available, redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
          }

          const response = await api.post('/auth/refresh', null, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            _retry: true // Mark this as a refresh request
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear token and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        // Either this is a refresh request that failed, or we already tried refreshing
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;