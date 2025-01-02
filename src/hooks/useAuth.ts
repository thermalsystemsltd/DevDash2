import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logOut, setInitialized } from '../store/slices/authSlice';
import { authApi, startSessionTimeout, clearSessionTimeout } from '../services/api';
import type { RootState } from '../store/store';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);

  const verifySession = useCallback(async () => {
    // Skip verification only if we're on login page
    if (location.pathname === '/login' || !isAuthenticated) return;

    try {
      const response = await authApi.verifyAccess();
      if (response.message === 'Valid Session' && response.data) {
        startSessionTimeout();
        dispatch(setUser({
          companyID: response.data.companyID,
          companyName: response.data.companyName,
          roles: ['user']
        }));
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      clearSessionTimeout();
      localStorage.clear();
      dispatch(logOut());
      navigate('/login', { replace: true });
    }
  }, [dispatch, navigate, location.pathname]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only verify if authenticated and not yet initialized
      if (isAuthenticated && !isInitialized) {
        await verifySession();
      }
      dispatch(setInitialized(true));
    };

    initializeAuth();
    
    // Only start session management if authenticated
    if (isAuthenticated) {
      startSessionTimeout();
    }

    return () => {
      clearSessionTimeout();
    };
  }, [verifySession, isAuthenticated, isInitialized, dispatch]);

  // Set up event listeners for auth events
  useEffect(() => {
    const handleAuthError = () => {
      dispatch(logOut());
      navigate('/login', { replace: true });
    };
    

    window.addEventListener('auth:unauthorized', handleAuthError);
    window.addEventListener('auth:forbidden', handleAuthError);
    window.addEventListener('auth:timeout', handleAuthError);

    return () => {
      window.removeEventListener('auth:unauthorized', handleAuthError);
      window.removeEventListener('auth:forbidden', handleAuthError);
      window.removeEventListener('auth:timeout', handleAuthError);
    };
  }, [dispatch, navigate]);
}