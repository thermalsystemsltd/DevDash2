import { create } from 'zustand';
import { UserData } from '../types/auth';

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuthStore;