import api from '@/lib/api';

export interface UserAnalytics {
  user: {
    id: string;
    subscription_tier: string;
    credits_used: number;
    credits_total: number;
  };
  analysis: {
    total_count: number;
    ai_count: number;
    human_count: number;
    avg_confidence: number;
    avg_processing_time: number;
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
  };
  analysis: {
    total: number;
    ai_detected: number;
    avg_confidence: number;
  };
  api: {
    total_requests: number;
    success_rate: number;
    avg_response_time: number;
  };
}

export const analyticsService = {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const response = await api.get(`/analytics/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw error;
    }
  },

  async getSystemAnalytics(): Promise<SystemAnalytics> {
    try {
      const response = await api.get('/analytics/system');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system analytics:', error);
      throw error;
    }
  },

  async trackAnalysis(
    userId: string,
    isAi: boolean,
    confidence: number,
    processingTime: number
  ): Promise<void> {
    try {
      await api.post(`/analytics/track/${userId}`, {
        is_ai: isAi,
        confidence,
        processing_time: processingTime
      });
    } catch (error) {
      console.error('Failed to track analysis:', error);
      throw error;
    }
  },

  async trackApiUsage(
    userId: string,
    endpoint: string,
    responseTime: number,
    success: boolean
  ): Promise<void> {
    try {
      await api.post(`/analytics/track/api/${userId}`, {
        endpoint,
        response_time: responseTime,
        success
      });
    } catch (error) {
      console.error('Failed to track API usage:', error);
      throw error;
    }
  }
};