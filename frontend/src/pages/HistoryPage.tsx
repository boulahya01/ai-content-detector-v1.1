import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAnalysis } from '../hooks/useAnalysis';
import { exportData } from '@/utils/export';
import type { AnalysisResult } from '@/types/api';

type FilterType = 'all' | 'ai-detected' | 'human-written';
type TimeRange = 'all-time' | 'today' | 'this-week' | 'this-month';

interface Filters {
  type: FilterType;
  timeRange: TimeRange;
}

export default function HistoryPage() {
  const { getHistory, loading } = useAnalysis();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    timeRange: 'all-time'
  });

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    try {
      const data = await getHistory(filters);
      setResults(data);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={filters.type}
            onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as FilterType }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/90 border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-500 min-w-[140px]"
          >
            <option value="all">All Results</option>
            <option value="ai-detected">AI Detected</option>
            <option value="human-written">Human Written</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={e => setFilters(prev => ({ ...prev, timeRange: e.target.value as TimeRange }))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/90 border border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-500 min-w-[140px]"
          >
            <option value="all-time">All Time</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>
        </div>

        <button
          onClick={() => {
            try {
              exportData.toCSV({
                title: 'Analysis History',
                data: results,
                columns: [
                  { key: 'id', label: 'ID' },
                  { key: 'contentPreview', label: 'Content' },
                  { key: 'authenticityScore', label: 'Authenticity Score' },
                  { key: 'confidenceLevel', label: 'Confidence Level' },
                  { 
                    key: 'analysisDetails.aiProbability', 
                    label: 'AI Probability'
                  },
                  {
                    key: 'analysisDetails.humanProbability',
                    label: 'Human Probability'
                  },
                  { key: 'createdAt', label: 'Created At' },
                  { key: 'fileName', label: 'File Name' }
                ]
              });
              toast.success('Export completed successfully');
            } catch (error) {
              toast.error('Failed to export results');
              console.error('Export error:', error);
            }
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium transition-colors text-center flex items-center justify-center gap-2 border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Results
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-white/90">
                      {result.authenticityScore}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      result.authenticityScore >= 80
                        ? 'bg-[#10b981]/10 text-[#10b981]'
                        : 'bg-[#ef4444]/10 text-[#ef4444]'
                    }`}>
                      {result.authenticityScore >= 80 ? 'Human Written' : 'AI Detected'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">
                    {result.text}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/40">Analyzed on:</span>
                      <span className="text-xs text-white/60">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/40">Language:</span>
                      <span className="text-xs text-white/60">
                        {result.language}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/analysis/${result.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-white/60 mb-4">No analysis results found</p>
          <Link
            to="/analysis"
            className="px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors"
          >
            Start Your First Analysis
          </Link>
        </div>
      )}
    </div>
  );
}