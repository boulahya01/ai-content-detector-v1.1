// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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