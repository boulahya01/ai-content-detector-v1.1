import { useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { AnalyticsCard } from './AnalyticsCard';

interface ChartDataPoint {
  label: string;
  ai: number;
  human: number;
}

export default function AnalysisDistributionChart() {
  const { userAnalytics, loading, error } = useAnalytics();

  const chartData = useMemo(() => {
    if (!userAnalytics) return [];

    // Get the last 7 days of data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    return days.slice(today + 1)
      .concat(days.slice(0, today + 1))
      .map(day => ({
        label: day,
        ai: Math.floor(userAnalytics.analysis.ai_count / 7),
        human: Math.floor(userAnalytics.analysis.human_count / 7)
      }));
  }, [userAnalytics]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => d.ai + d.human));
  }, [chartData]);

  const getBarHeight = (value: number) => {
    return maxValue ? `${(value / maxValue) * 100}%` : '0%';
  };

  return (
    <AnalyticsCard 
      title="Weekly Analysis Distribution" 
      isLoading={loading}
      error={error}
    >
      <div className="h-64">
        {chartData.length > 0 ? (
          <div className="flex items-end justify-between h-full">
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-col items-center w-1/8">
                <div className="flex flex-col-reverse w-8 mb-2">
                  <div 
                    className="bg-accent-3 rounded-t"
                    style={{ height: getBarHeight(data.ai) }}
                  />
                  <div 
                    className="bg-accent-1 rounded-t"
                    style={{ height: getBarHeight(data.human) }}
                  />
                </div>
                <span className="text-xs text-white/60">{data.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/60">
            No data available
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-accent-3 rounded mr-2" />
          <span className="text-sm text-white/60">AI Content</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-accent-1 rounded mr-2" />
          <span className="text-sm text-white/60">Human Content</span>
        </div>
      </div>
    </AnalyticsCard>
  );
}