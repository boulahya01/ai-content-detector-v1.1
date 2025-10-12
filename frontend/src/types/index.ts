// Re-export all types
export * from './api';

// User Types
export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  lastLoginAt: string;
};

// Subscription and Plan Types
export type Subscription = {
  id: string;
  planType: 'basic' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  analysisLimit: number;
  features: string[];
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  analysisLimit: number;
  isPopular?: boolean;
};

// Analysis Types
export type AnalysisResult = {
  id: string;
  contentPreview: string;
  authenticityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  analysisDetails: Record<string, any>;
  createdAt: string;
  fileName?: string;
};

export type UsageStats = {
  analysesCount: number;
  monthYear: string;
  limit: number;
};

// Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
}

export interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  updateSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

// Component Props Types
export interface PageProps {
  title?: string;
}

export interface PrivateRouteProps {
  element: React.ReactElement;
  requiredSubscription?: 'basic' | 'pro';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  name?: string;
  confirmPassword: string;
}

export interface AnalysisFormData {
  text: string;
  options?: {
    detailed: boolean;
    language?: string;
  };
}