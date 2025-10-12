import api from '../lib/api';
import { User } from '../types';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

export interface LoginCredentials {
  username: string;  // Using username field as email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface VerificationResponse {
  message: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  try {
    const response = await api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Registration failed');
  }
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const response = await api.post('/auth/google', { credential });
  return response.data;
}

export async function refreshAccessToken(token: string): Promise<TokenResponse> {
  const response = await api.post('/auth/refresh', null, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getProfile(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.patch('/auth/me', data);
  return response.data;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  });
}

export async function forgotPassword(email: string): Promise<VerificationResponse> {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', {
    token,
    new_password: password
  });
}

export async function verifyEmail(token: string): Promise<VerificationResponse> {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

export async function resendVerification(): Promise<VerificationResponse> {
  const response = await api.post('/auth/resend-verification');
  return response.data;
}