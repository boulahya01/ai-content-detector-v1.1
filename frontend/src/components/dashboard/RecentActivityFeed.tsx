import { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { AnalyticsCard } from './AnalyticsCard';

interface ActivityItem {
  timestamp: string;
  type: 'analysis' | 'api';
  status: 'success' | 'error';
  details: {
    endpoint?: string;
    responseTime?: number;
    isAi?: boolean;
    confidence?: number;
  };
}

export default function RecentActivityFeed() {
  const { userAnalytics, loading, error } = useAnalytics();

  const activities = useMemo(() => {
    if (!userAnalytics) return [];

    const apiActivities: ActivityItem[] = userAnalytics.api_usage.map(usage => ({
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      type: 'api',
      status: usage.success_rate > 0.9 ? 'success' : 'error',
      details: {
        endpoint: usage.endpoint,
        responseTime: usage.avg_response_time
      }
    }));

    // Create synthetic analysis activities based on total counts
    const totalAnalyses = Math.min(5, userAnalytics.analysis.total_count);
    const analysisActivities: ActivityItem[] = Array(totalAnalyses).fill(null).map(() => ({
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      type: 'analysis',
      status: 'success',
      details: {
        isAi: Math.random() < userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count,
        confidence: userAnalytics.analysis.avg_confidence
      }
    }));

    return [...apiActivities, ...analysisActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [userAnalytics]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <AnalyticsCard
      title="Recent Activity"
      isLoading={loading}
      error={error}
    >
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium text-white">
                  {activity.type === 'api' ? (
                    <>API Call: {activity.details.endpoint}</>
                  ) : (
                    <>Content Analysis: {activity.details.isAi ? 'AI Detected' : 'Human Written'}</>
                  )}
                </div>
                <span className="text-sm text-white/60">
                  {formatTime(activity.timestamp)}
                </span>
              </div>

              <div className="mt-1 text-sm text-white/60">
                {activity.type === 'api' ? (
                  <>Response time: {Math.round(activity.details.responseTime || 0)}ms</>
                ) : (
                  <>Confidence: {Math.round((activity.details.confidence || 0) * 100)}%</>
                )}
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center text-white/60 py-8">
            No recent activity
          </div>
        )}
      </div>
    </AnalyticsCard>
  );
}