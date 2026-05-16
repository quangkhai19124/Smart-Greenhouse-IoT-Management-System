import { HttpError } from '@refinedev/core';
import axios from 'axios';
import { IDENTIFY_KEY } from '@/utils/constants';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;
    
    // Check for invalid token in response (backend might not return 401 status)
    const isInvalidToken = responseData?.EC === -1 && 
                          responseData?.EM?.toLowerCase().includes('invalid token');
    
    // Immediately handle 401 errors or invalid token without retries
    if (statusCode === 401 || isInvalidToken) {
      // Clear identity and redirect to login
      localStorage.removeItem(IDENTIFY_KEY);
      
      // Return a custom error that will be handled by auth provider
      const customError: HttpError = {
        ...error,
        message: isInvalidToken ? responseData.EM : 'Session expired',
        statusCode: 401,
      };
      
      // Redirect immediately without retry
      if (window.location.pathname !== '/auth/signin') {
        window.location.href = '/auth/signin';
      }
      
      return Promise.reject(customError);
    }
    
    // Backend response format: { EC, EM, DT }
    // EC: 0 = success, 1 = error, -1 = server error
    // EM: Error Message
    // DT: Data
    let errorMessage = 'Something went wrong';
    
    if (error.response?.data?.EM) {
      // Backend format
      errorMessage = error.response.data.EM;
    } else if (error.response?.data?.meta?.error) {
      // Alternative format
      errorMessage = error.response.data.meta.error;
    } else if (error.response?.data?.message) {
      // Standard format
      errorMessage = error.response.data.message;
    } else if ([400, 403, 404].includes(statusCode)) {
      errorMessage = 'An unexpected error occurred.';
    }

    const customError: HttpError = {
      ...error,
      message: errorMessage,
      statusCode,
    };

    return Promise.reject(customError);
  }
);

export { axiosInstance };
