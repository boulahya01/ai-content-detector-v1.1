export interface AnalyticsData {
  user?: {
    id: string;
    user_type: string;
    shobeis_balance: number;
    bonus_balance: number;
    total_words_analyzed: number;
    total_api_calls: number;
    total_exports: number;
  };
  analysis?: {
    total_count: number;
    ai_count: number;
    human_count: number;
    avg_confidence: number;
    avg_processing_time: number;
  };
  api_usage?: Array<{
    endpoint: string;
    request_count: number;
    success_rate: number;
    avg_response_time: number;
  }>;
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

export interface SystemHealth {
  status: string;
  uptime: string;
  loadMetrics: {
    requestsPerMinute: number;
    avgResponseTime: number;
    errorRate: number;
  };
  userMetrics: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  analysisMetrics: {
    totalAnalyses: number;
    dailyAverage: number;
    successRate: number;
  };
  recentErrors: Array<{
    endpoint: string;
    count: number;
  }>;
}