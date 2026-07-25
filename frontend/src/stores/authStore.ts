import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/api/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        set({ token: response.data.access_token });
        await useAuthStore.getState().loadUser();
      },

      register: async (email: string, password: string, fullName?: string) => {
        await api.post('/api/auth/register', {
          email,
          password,
          full_name: fullName,
        });

        await useAuthStore.getState().login(email, password);
      },

      logout: () => {
        set({ token: null, user: null });
      },

      loadUser: async () => {
        try {
          const response = await api.get('/api/auth/me');
          set({ user: response.data });
        } catch {
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
