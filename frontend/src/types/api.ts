// API Response Types
export interface ApiResponse<T> {
  data: T & { analysisId?: string };
  status: number;
  message?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  credits: number;
  avatar?: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Analysis Types
export interface AnalysisRequest {
  text: string;
  language?: string;
  options?: {
    detailed?: boolean;
    threshold?: number;
  };
}

export interface AnalysisProgress {
  analysisId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  stage?: 'initialization' | 'processing' | 'validation' | 'finalization';
  message?: string;
  result?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  id: string;
  contentPreview: string;
  authenticityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  analysisDetails: {
    aiProbability: number;
    humanProbability: number;
    indicators: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
  };
  createdAt: string;
  fileName?: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  features: string[];
  usage: {
    current: number;
    limit: number;
  };
}