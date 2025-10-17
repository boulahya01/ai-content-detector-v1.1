import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyticsService, UserAnalytics, SystemAnalytics } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsContextType {
  userAnalytics: UserAnalytics | null;
  systemAnalytics: SystemAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchUserAnalytics: () => Promise<void>;
  fetchSystemAnalytics: () => Promise<void>;
  trackAnalysis: (isAi: boolean, confidence: number, processingTime: number) => Promise<void>;
  trackApiUsage: (endpoint: string, responseTime: number, success: boolean) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default analytics for basic users (free credits, others 0)
  const defaultUserAnalytics: UserAnalytics = {
    user: {
      id: '',
      subscription_tier: 'free',
      credits_used: 0,
      credits_total: 5,
    },
    analysis: {
      total_count: 0,
      ai_count: 0,
      human_count: 0,
      avg_confidence: 0,
      avg_processing_time: 0,
    },
    api_usage: [],
  };
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(defaultUserAnalytics);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // Only keep the safe auto-refresh effect (see above)

  const fetchUserAnalytics = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getUserAnalytics(user.id);
      setUserAnalytics(data);
    } catch (err) {
      setError('Failed to fetch user analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSystemAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getSystemAnalytics();
      setSystemAnalytics(data);
    } catch (err) {
      setError('Failed to fetch system analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackAnalysis = useCallback(
    async (isAi: boolean, confidence: number, processingTime: number) => {
      if (!user?.id) return;

      try {
        await analyticsService.trackAnalysis(user.id, isAi, confidence, processingTime);
        // Optionally refresh analytics after tracking
        await fetchUserAnalytics();
      } catch (err) {
        console.error('Failed to track analysis:', err);
      }
    },
    [user?.id, fetchUserAnalytics]
  );

  const trackApiUsage = useCallback(
    async (endpoint: string, responseTime: number, success: boolean) => {
      if (!user?.id) return;

      try {
        await analyticsService.trackApiUsage(user.id, endpoint, responseTime, success);
        // Optionally refresh analytics after tracking
        await fetchUserAnalytics();
      } catch (err) {
        console.error('Failed to track API usage:', err);
      }
    },
    [user?.id, fetchUserAnalytics]
  );

  // Load analytics data once when the component mounts
  React.useEffect(() => {
    if (user?.id) {
      fetchUserAnalytics();
      fetchSystemAnalytics();
    }
  }, [user?.id]); // Only run when user changes

  const value = {
    userAnalytics,
    systemAnalytics,
    loading,
    error,
    fetchUserAnalytics,
    fetchSystemAnalytics,
    trackAnalysis,
    trackApiUsage,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};