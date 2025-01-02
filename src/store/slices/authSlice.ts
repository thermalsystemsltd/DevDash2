import { createSlice } from '@reduxjs/toolkit';
import { startSessionTimeout, clearSessionTimeout } from '../../services/api';

interface User {
  companyID: number;
  companyName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Store auth state in localStorage for persistence
      if (action.payload) {
        localStorage.setItem('auth', JSON.stringify({
          user: action.payload,
          isAuthenticated: true
        }));
      }
      startSessionTimeout();
    },
    logOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = false;
      localStorage.removeItem('auth');
      sessionStorage.clear();
      clearSessionTimeout();
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    restoreAuth: (state) => {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const { user, isAuthenticated } = JSON.parse(stored);
        state.user = user;
        state.isAuthenticated = isAuthenticated;
      }
    }
  },
});

export const { setUser, logOut, setInitialized, restoreAuth } = authSlice.actions;
export default authSlice.reducer;