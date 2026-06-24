import axios from 'axios';

const backendBaseUrl = import.meta.env.VITE_REACT_APP_ENV === 'production' ? import.meta.env.VITE_BACKEND_BASE_URL_PROD : import.meta.env.VITE_BACKEND_BASE_URL;

const axiosClient = axios.create({
  baseURL: `${backendBaseUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookie handling
});

// Add response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;