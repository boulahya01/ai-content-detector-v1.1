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
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string; }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleUser = (userData: User) => {
    // Map backend fields to frontend user shape.
    // Backend may return shobeis_balance, monthly_balance, bonus_balance.
    const mapped: any = { ...userData } as any;
    // Ensure credits property exists for UI (total available credits)
    const shobeis = (userData as any).shobeis_balance ?? 0;
    const monthly = (userData as any).monthly_balance ?? 0;
    const bonus = (userData as any).bonus_balance ?? 0;
    mapped.credits = shobeis + monthly + bonus;
    // Also expose the individual balances so other components can consume them
    mapped.shobeis_balance = shobeis;
    mapped.monthly_balance = monthly;
    mapped.bonus_balance = bonus;

    setUser(mapped as User);
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
      // Use react-router's navigate instead of window.location
      return;
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const { name, email, currentPassword, newPassword } = data;
    
    if (currentPassword && newPassword) {
      await authApi.changePassword(currentPassword, newPassword);
    }

    if (name || email) {
      const userData = await authApi.updateProfile({
        first_name: name ? name.split(' ')[0] : undefined,
        last_name: name ? name.split(' ').slice(1).join(' ') : undefined,
        email,
      });
      updateUser(userData);
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
      updateUser,
      updateProfile
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