import api from '@/lib/api';

export interface UserAnalytics {
  user: {
    id: string;
    subscription_tier: string;
    credits_used: number;
    credits_total: number;
    total_words_analyzed: number;
    total_api_calls: number;
    total_exports: number;
  };
  analysis: {
    total_count: number;
    ai_count: number;
    human_count: number;
    avg_confidence: number;
    avg_processing_time: number;
    total_content_length: number;
  };
  api_usage: Array<{
    endpoint: string;
    request_count: number;
    success_rate: number;
    avg_response_time: number;
  }>;
}

export interface SystemAnalytics {
  users: {
    total: number;
    activeToday: number;
    activeWeek: number;
    activeMonth: number;
  };
  analysis: {
    total: number;
    ai_detected: number;
    avg_confidence: number;
    daily_average: number;
    weekly_trend: Array<{
      date: string;
      count: number;
    }>;
  };
  api: {
    total_requests: number;
    success_rate: number;
    avg_response_time: number;
    recent_errors: Array<{
      endpoint: string;
      count: number;
    }>;
  };
}

export interface UsageStats {
  summary: {
    totalAnalyses: number;
    aiDetected: number;
    humanDetected: number;
    avgConfidence: number;
    avgProcessingTime: number;
    totalCreditsUsed: number;
    timeframe: string;
  };
  apiUsage: Array<{
    endpoint: string;
    requests: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  timeline: Array<{
    date: string;
    value: number;
  }>;
}

export const analyticsService = {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const response = await api.get(`/api/analytics/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // Let caller decide how to surface errors (context/components will show toasts)
      throw error;
    }
  },

  async getSystemAnalytics(): Promise<SystemAnalytics> {
    try {
      const response = await api.get('/api/analytics/system');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async getUsageStats(timeframe: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<UsageStats> {
    try {
      const response = await api.get(`/api/analytics/usage-stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async getSystemHealth(): Promise<SystemAnalytics> {
    try {
      const response = await api.get('/api/analytics/system-health');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async trackAnalysis(params: {
    userId: string;
    isAi: boolean;
    confidence: number;
    processingTime: number;
    contentLength?: number;
    creditsUsed?: number;
  }): Promise<void> {
    try {
      const { userId, ...data } = params;
      await api.post(`/api/analytics/track/${userId}`, {
        is_ai: data.isAi,
        confidence: data.confidence,
        processing_time: data.processingTime,
        content_length: data.contentLength,
        credits_used: data.creditsUsed
      });
    } catch (error: any) {
      throw error;
    }
  },

  async trackApiUsage(params: {
    userId: string;
    endpoint: string;
    responseTime: number;
    success: boolean;
    errorDetails?: string;
  }): Promise<void> {
    try {
      const { userId, ...data } = params;
      await api.post(`/api/analytics/track/api/${userId}`, {
        endpoint: data.endpoint,
        response_time: data.responseTime,
        success: data.success,
        error_details: data.errorDetails
      });
    } catch (error: any) {
      throw error;
    }
  }
};