import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { store } from '../store/store';

const api = axios.create(API_CONFIG);

// Add auth headers to all requests
api.interceptors.request.use(config => {
  const state = store.getState();
  const user = state.auth.user;

  if (user) {
    config.headers['x-company-id'] = user.companyID.toString();
    config.headers['x-company-name'] = user.companyName;
  }

  return config;
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('Request:', {
        method: config.method?.toUpperCase(),
        url: config.url
      });
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('Response:', {
        status: response.status,
        url: response.config.url
      });
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error('Response Error:', {
        status: error.response?.status,
        message: error.message
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      startSessionTimeout();
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      clearSessionTimeout();
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },
  
  verifyAccess: async () => {
    try {
      const response = await api.get('/auth/verifyAccess');
      startSessionTimeout();
      if (import.meta.env.DEV) {
        console.log('Verify Access Response:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Verify Access Error:', error);
      throw error;
    }
  },
  
  registerBiometrics: async (userId: number) => {
    try {
      const response = await api.post('/auth/biometrics/register', { userId });
      return response.data;
    } catch (error) {
      console.error('Biometrics Registration Error:', error);
      throw error;
    }
  },
  
  completeBiometricsRegistration: async (userId: number, credential: any) => {
    try {
      const response = await api.post('/auth/biometrics/complete', {
        userId,
        credential
      });
      return response.data;
    } catch (error) {
      console.error('Biometrics Completion Error:', error);
      throw error;
    }
  }
};

// Session timeout handling
let sessionTimeoutId: number;
let verificationIntervalId: number;

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes session duration
const VERIFICATION_INTERVAL = 4 * 60 * 1000; // Verify every 4 minutes

export const startSessionTimeout = () => {
  clearSessionTimeout();

  // Set session timeout
  sessionTimeoutId = window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('auth:timeout'));
  }, SESSION_DURATION);

  // Set up periodic verification
  verificationIntervalId = window.setInterval(async () => {
    try {
      await authApi.verifyAccess();
    } catch (error) {
      console.error('Session verification failed:', error);
      window.dispatchEvent(new CustomEvent('auth:timeout'));
    }
  }, VERIFICATION_INTERVAL);
};

export const clearSessionTimeout = () => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }
  if (verificationIntervalId) {
    clearInterval(verificationIntervalId);
  }
};