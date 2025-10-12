import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, null, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;