import { useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Card, Metric } from '@/components/ui/card';

export function UserAnalyticsDashboard() {
  const { userAnalytics, loading, error, fetchUserAnalytics } = useAnalytics();

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading analytics: {error}</div>;
  }

  if (!userAnalytics) {
    return <div className="text-center py-8 text-gray-500">No analytics data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Usage Overview */}
      <Card title="Usage Overview">
        <Metric label="Credits Used" value={userAnalytics.user.credits_used} />
        <Metric label="Total Credits" value={userAnalytics.user.credits_total} />
        <Metric label="Subscription" value={userAnalytics.user.subscription_tier} />
      </Card>

      {/* Analysis Stats */}
      <Card title="Analysis Statistics">
        <Metric label="Total Analyses" value={userAnalytics.analysis.total_count} />
        <Metric label="AI Detected" value={userAnalytics.analysis.ai_count} />
        <Metric label="Human Written" value={userAnalytics.analysis.human_count} />
        <Metric 
          label="Avg. Confidence" 
          value={`${Math.round(userAnalytics.analysis.avg_confidence * 100)}%`} 
        />
      </Card>

      {/* API Usage */}
      <Card title="API Performance">
        {userAnalytics.api_usage.map((usage) => (
          <div key={usage.endpoint} className="mb-4 last:mb-0">
            <h4 className="font-medium mb-2">{usage.endpoint}</h4>
            <Metric label="Requests" value={usage.request_count} />
            <Metric 
              label="Success Rate" 
              value={`${Math.round(usage.success_rate * 100)}%`} 
            />
            <Metric 
              label="Avg. Response" 
              value={`${Math.round(usage.avg_response_time)}ms`} 
            />
          </div>
        ))}
      </Card>
    </div>
  );
}