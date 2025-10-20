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
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  params.append('grant_type', 'password');

  try {
    console.log('Attempting login with credentials:', {
      username: credentials.username,
      grant_type: 'password'
    });

    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      console.log('Login successful');
      return response.data;
    }
    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('Login error:', error);
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Login failed. Please try again.';
    
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    } else {
      throw new Error(errorMessage);
    }
  }
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    console.log('Attempting registration with data:', {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name
    });

    const response = await api.post('/auth/register', data);
    
    if (response.data && response.data.id) {
      console.log('Registration successful');
      return response.data;
    }
    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('Registration error:', error);
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message ||
                        error.message || 
                        'Registration failed. Please try again.';
    
    if (error.response?.status === 400) {
      // Handle validation errors
      if (error.response.data.detail?.includes('Email already registered')) {
        throw new Error('This email is already registered');
      } else if (error.response.data.detail?.includes('Password')) {
        throw new Error(error.response.data.detail);
      }
    }
    
    throw new Error(errorMessage);
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