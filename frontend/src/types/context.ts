import type { User, Subscription, AnalysisResult } from './api';

// Global State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
}

export interface AnalysisState {
  currentAnalysis: AnalysisResult | null;
  history: AnalysisResult[];
  isAnalyzing: boolean;
  error: string | null;
}

// Action Types
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

export interface SubscriptionActions {
  updateSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

export interface AnalysisActions {
  analyzeText: (text: string) => Promise<void>;
  analyzeFile: (file: File) => Promise<void>;
  clearCurrentAnalysis: () => void;
  fetchHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
}

// Context Types
export interface AuthContextType extends AuthState, AuthActions {}
export interface SubscriptionContextType extends SubscriptionState, SubscriptionActions {}
export interface AnalysisContextType extends AnalysisState, AnalysisActions {}