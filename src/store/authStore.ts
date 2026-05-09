import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem('token'),
      user: localStorage.getItem('token') ? (jwtDecode(localStorage.getItem('token')!) as any) : null,
      setAuth: (token: string) => {
        localStorage.setItem('token', token);
        const decoded: any = jwtDecode(token);
        console.log('decoded:', decoded);
        const role = decoded.Role || decoded.role || 'USER';
        set({ token, user: { username: decoded.sub, role } });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
