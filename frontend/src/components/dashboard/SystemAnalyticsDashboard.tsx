import { useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Card, Metric } from '@/components/ui/card';

export function SystemAnalyticsDashboard() {
  const { systemAnalytics, loading, error, fetchSystemAnalytics } = useAnalytics();

  useEffect(() => {
    fetchSystemAnalytics();
  }, [fetchSystemAnalytics]);

  if (loading) {
    return <div className="text-center py-8">Loading system analytics...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading system analytics: {error}</div>;
  }

  if (!systemAnalytics) {
    return <div className="text-center py-8 text-gray-500">No system analytics data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* User Stats */}
      <Card title="User Statistics">
        <Metric label="Total Users" value={systemAnalytics.users.total} />
      </Card>

      {/* Analysis Stats */}
      <Card title="Analysis Overview">
        <Metric label="Total Analyses" value={systemAnalytics.analysis.total} />
        <Metric label="AI Detected" value={systemAnalytics.analysis.ai_detected} />
        <Metric 
          label="Avg. Confidence" 
          value={`${Math.round(systemAnalytics.analysis.avg_confidence * 100)}%`} 
        />
      </Card>

      {/* API Performance */}
      <Card title="API Performance">
        <Metric label="Total Requests" value={systemAnalytics.api.total_requests} />
        <Metric 
          label="Success Rate" 
          value={`${Math.round(systemAnalytics.api.success_rate * 100)}%`} 
        />
        <Metric 
          label="Avg. Response Time" 
          value={`${Math.round(systemAnalytics.api.avg_response_time)}ms`} 
        />
      </Card>
    </div>
  );
}