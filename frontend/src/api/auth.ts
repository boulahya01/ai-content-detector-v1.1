import api from '../lib/api';
import { User } from '../types';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const response = await api.post('/auth/google', { credential });
  return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getProfile(): Promise<User> {
  const response = await api.get('/auth/profile');
  return response.data;
}