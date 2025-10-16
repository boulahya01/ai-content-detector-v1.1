import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { AnalyticsCard } from './AnalyticsCard';
import Skeleton from '@/components/ui/Skeleton';
import { exportData } from '@/utils/export';

export interface KPIOverview {
  totalAnalyses: number;
  aiCount: number;
  humanCount: number;
  aiRatio: number; // 0..1
  avgConfidence: number; // 0..1
  avgProcessingMs: number;
}

export default function KPIOverviewCard() {
  const { userAnalytics, loading, error } = useAnalytics();
  if (!userAnalytics) {
    return (
      <AnalyticsCard title="Overview" isLoading={loading} error={error}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-start">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </AnalyticsCard>
    );
  }

  const kpis = {
    totalAnalyses: userAnalytics.analysis.total_count,
    aiCount: userAnalytics.analysis.ai_count,
    humanCount: userAnalytics.analysis.human_count,
    aiRatio: userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count,
    avgConfidence: userAnalytics.analysis.avg_confidence,
    avgProcessingMs: userAnalytics.analysis.avg_processing_time
  };

  return (
    <AnalyticsCard
      title="Overview"
      isLoading={loading}
      error={error}
      onExportCSV={() => exportData.toCSV({
        title: 'Analysis-Overview',
        data: [{
          total_analyses: kpis.totalAnalyses,
          ai_content: kpis.aiCount,
          human_content: kpis.humanCount,
          ai_ratio: `${(kpis.aiRatio * 100).toFixed(1)}%`,
          avg_confidence: `${(kpis.avgConfidence * 100).toFixed(1)}%`,
          avg_processing: `${kpis.avgProcessingMs} ms`
        }],
        columns: [
          { key: 'total_analyses', label: 'Total Analyses' },
          { key: 'ai_content', label: 'AI Content' },
          { key: 'human_content', label: 'Human Content' },
          { key: 'ai_ratio', label: 'AI Ratio' },
          { key: 'avg_confidence', label: 'Average Confidence' },
          { key: 'avg_processing', label: 'Average Processing Time' }
        ]
      })}
      onExportPDF={() => exportData.toPDF({
        title: 'Analysis Overview',
        data: [{
          total_analyses: kpis.totalAnalyses,
          ai_content: kpis.aiCount,
          human_content: kpis.humanCount,
          ai_ratio: `${(kpis.aiRatio * 100).toFixed(1)}%`,
          avg_confidence: `${(kpis.avgConfidence * 100).toFixed(1)}%`,
          avg_processing: `${kpis.avgProcessingMs} ms`
        }],
        columns: [
          { key: 'total_analyses', label: 'Total Analyses' },
          { key: 'ai_content', label: 'AI Content' },
          { key: 'human_content', label: 'Human Content' },
          { key: 'ai_ratio', label: 'AI Ratio' },
          { key: 'avg_confidence', label: 'Average Confidence' },
          { key: 'avg_processing', label: 'Average Processing Time' }
        ]
      })}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">Total Analyses</span>
          <span className="text-2xl font-bold text-accent-3 animate-fade-in">{kpis.totalAnalyses.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">AI Content</span>
          <span className="text-2xl font-bold text-accent-3 animate-fade-in">{kpis.aiCount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">Human Content</span>
          <span className="text-2xl font-bold text-accent-1 animate-fade-in">{kpis.humanCount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">AI Ratio</span>
          <span className="text-xl font-bold text-accent-3 animate-fade-in">{(kpis.aiRatio * 100).toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">Avg Confidence</span>
          <span className="text-xl font-bold text-accent-2 animate-fade-in">{(kpis.avgConfidence * 100).toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-start transition-all duration-700">
          <span className="text-muted text-sm">Avg Processing</span>
          <span className="text-xl font-bold text-accent-1 animate-fade-in">{kpis.avgProcessingMs} ms</span>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AnalyticsCard>
  );
}