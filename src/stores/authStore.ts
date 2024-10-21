import create from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email, password) => {
        try {
          const user = await apiLogin(email, password);
          set({ isAuthenticated: true, user });
        } catch (error) {
          console.error('Login failed:', error);
          throw new Error('Login failed. Please check your credentials and try again.');
        }
      },
      register: async (name, email, password) => {
        try {
          const user = await apiRegister(name, email, password);
          set({ isAuthenticated: true, user });
        } catch (error) {
          console.error('Registration failed:', error);
          throw new Error('Registration failed. Please try again.');
        }
      },
      logout: async () => {
        try {
          await apiLogout();
          set({ isAuthenticated: false, user: null });
        } catch (error) {
          console.error('Logout failed:', error);
          throw new Error('Logout failed. Please try again.');
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);