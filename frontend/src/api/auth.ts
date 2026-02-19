import api from '@/lib/axios';
import type { User } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  role: 'candidate' | 'employer';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
};
