import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyticsService, UserAnalytics, SystemAnalytics, UsageStats } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type TimeframeOption = '24h' | '7d' | '30d' | 'all';

interface AnalyticsContextType {
  userAnalytics: UserAnalytics | null;
  systemAnalytics: SystemAnalytics | null;
  usageStats: UsageStats | null;
  timeframe: TimeframeOption;
  loading: boolean;
  error: string | null;
  fetchUserAnalytics: () => Promise<void>;
  fetchSystemAnalytics: () => Promise<void>;
  fetchUsageStats: () => Promise<void>;
  setTimeframe: (timeframe: TimeframeOption) => void;
  trackAnalysis: (params: {
    isAi: boolean;
    confidence: number;
    processingTime: number;
    contentLength?: number;
    creditsUsed?: number;
  }) => Promise<void>;
  trackApiUsage: (params: {
    endpoint: string;
    responseTime: number;
    success: boolean;
    errorDetails?: string;
  }) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with null so UI waits for real API data instead of showing hardcoded placeholders
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7d');
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
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to fetch user analytics';
      setError(msg);
      toast.error(msg);
      console.error('fetchUserAnalytics error:', err);
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
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to fetch system analytics';
      setError(msg);
      toast.error(msg);
      console.error('fetchSystemAnalytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackAnalysis = useCallback(
    async (params: {
      isAi: boolean;
      confidence: number;
      processingTime: number;
      contentLength?: number;
      creditsUsed?: number;
    }) => {
      if (!user?.id) return;

      try {
        await analyticsService.trackAnalysis({
          userId: user.id,
          ...params
        });
        // Optionally refresh analytics after tracking
        await fetchUserAnalytics();
        await fetchUsageStats();
      } catch (err) {
        console.error('Failed to track analysis:', err);
      }
    },
    [user?.id, fetchUserAnalytics]
  );

  const trackApiUsage = useCallback(
    async (params: {
      endpoint: string;
      responseTime: number;
      success: boolean;
      errorDetails?: string;
    }) => {
      if (!user?.id) return;

      try {
        await analyticsService.trackApiUsage({
          userId: user.id,
          ...params
        });
        // Optionally refresh analytics after tracking
        await fetchUserAnalytics();
        await fetchUsageStats();
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

  const fetchUsageStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getUsageStats(timeframe);
      setUsageStats(data);
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to fetch usage statistics';
      setError(msg);
      toast.error(msg);
      console.error('fetchUsageStats error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeframe]);

  // Fetch usage stats when timeframe changes
  React.useEffect(() => {
    if (user?.id) {
      fetchUsageStats();
    }
  }, [timeframe, user?.id, fetchUsageStats]);

  const value = {
    userAnalytics,
    systemAnalytics,
    usageStats,
    timeframe,
    loading,
    error,
    fetchUserAnalytics,
    fetchSystemAnalytics,
    fetchUsageStats,
    setTimeframe,
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