import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types/api';
import * as authApi from '../api/auth';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  username: string; // Using username for email as per API
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleUser = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.getProfile()
        .then(userData => {
          if (userData.is_active) {
            handleUser(userData);
          } else {
            // If user is not active (email not verified), log them out
            localStorage.removeItem('access_token');
            setUser(null);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    localStorage.setItem('access_token', response.access_token);
    const userData = await authApi.getProfile();
    handleUser(userData);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    localStorage.setItem('access_token', response.access_token);
    const userData = await authApi.getProfile();
    handleUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}