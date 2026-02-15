import axios, { AxiosError } from 'axios';
import type { AuthResponse, LoginCredentials, RegisterData, User, ApiError } from '@/types/auth';
import { apiGet, apiPost } from './http';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (token) {
    config.headers?.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiPost<AuthResponse, RegisterData>('/v1/auth/register', data);
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiPost<AuthResponse, LoginCredentials>('/v1/auth/login', credentials);
  },

  async getCurrentUser(): Promise<User> {
    const { user } = await apiGet<{ user: User }>('/v1/users/me');
    return user;
  },
};

export default apiClient;
