import React from 'react';
import type { AnalysisResult } from '@/types/api';
import ConfidenceIndicator from './ConfidenceIndicator';
import { formStyles } from '@/components/auth/styles';

interface AnalysisResultsProps {
  result: AnalysisResult;
  showDetails?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  showDetails = true
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-[color:var(--surface-500)] border border-white/6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Analysis Results</h3>
            <div className="text-sm text-white/70">Summary of the content analysis and confidence metrics</div>
          </div>
          <div className="flex items-center gap-4">
            <button className={formStyles.button + ' text-sm px-3 py-2 rounded-full bg-white/5'}>Download</button>
            <button className={formStyles.button + ' text-sm px-3 py-2 rounded-full bg-accent-500'}>Compare</button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm font-medium text-white/70">AI Detection Score</div>
              <ConfidenceIndicator score={result.authenticityScore} size={64} />
            </div>
          </div>

          {showDetails && result.analysisDetails && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Detailed Analysis</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/3">
                    <div className="text-sm text-white/70">AI Probability</div>
                    <div className="text-lg font-semibold">{result.analysisDetails.aiProbability}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/3">
                    <div className="text-sm text-white/70">Human Probability</div>
                    <div className="text-lg font-semibold">{result.analysisDetails.humanProbability}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-white/70 mb-2">Indicators</h5>
                  <div className="space-y-2">
                    {result.analysisDetails.indicators.map((indicator, index) => (
                      <div key={index} className="text-sm p-3 rounded-lg bg-white/4 border border-white/6">
                        <div className="font-medium text-white/90">{indicator.type}</div>
                        <div className="text-white/70">{indicator.description}</div>
                        <div className="text-white/60 mt-1">Confidence: {indicator.confidence}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-4">
            Analyzed on {formatDate(result.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;