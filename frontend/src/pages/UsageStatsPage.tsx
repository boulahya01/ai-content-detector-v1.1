import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LineChart from '@/components/charts/LineChart';
import TimeFrameSelector from '@/components/TimeFrameSelector';
import StatsCard from '@/components/StatsCard';
import { UsageStats } from '@/api/analytics';

export default function UsageStatsPage() {
  const { usageStats, loading, error, fetchUsageStats, timeframe, setTimeframe } = useAnalytics();
  
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <p className="text-destructive">Error loading usage stats: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Usage Statistics"
        description="Track your API and content analysis usage"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <StatsCard
          title="API Calls"
          value={usageStats?.summary?.totalAnalyses || 0}
          description="Total API requests made"
        />

        <StatsCard
          title="AI Content Detected"
          value={usageStats?.summary?.aiDetected || 0}
          description="Total AI-generated content detected"
        />

        <StatsCard
          title="Credits Used"
          value={usageStats?.summary?.totalCreditsUsed || 0}
          description="Total credits consumed"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Usage Over Time</h3>
            
            <TimeFrameSelector
              value={timeframe}
              onChange={(value) => setTimeframe(value)}
            />
          </div>

          {usageStats?.timeline && usageStats.timeline.length > 0 ? (
            <LineChart
              data={usageStats.timeline}
              dataKey="creditsUsed"
              xAxisKey="date"
              yAxisLabel="Credits"
              height={300}
            />
          ) : (
            <div className="h-64 flex items-center justify-center border rounded">
              <p className="text-muted-foreground">No usage data available for selected timeframe</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">API Usage by Endpoint</h3>
          {usageStats?.apiUsage && usageStats.apiUsage.length > 0 ? (
            <div className="space-y-4">
              {usageStats.apiUsage.map((api: { endpoint: string; requests: number; successRate: number; avgResponseTime: number }, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{api.endpoint}</p>
                    <p className="text-sm text-muted-foreground">
                      Success Rate: {Math.round(api.successRate)}% · Avg Response: {Math.round(api.avgResponseTime)}ms
                    </p>
                  </div>
                  <div className="text-accent-500 font-medium">{api.requests} requests</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No API usage data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}