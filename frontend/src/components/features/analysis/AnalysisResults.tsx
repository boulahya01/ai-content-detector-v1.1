import React from 'react';
import type { AnalysisResult } from '@/types/api';
import ConfidenceIndicator from './ConfidenceIndicator';

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">AI Detection Score</label>
            <ConfidenceIndicator score={result.authenticityScore} size="lg" />
          </div>

          {showDetails && result.analysisDetails && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Detailed Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Probability</span>
                  <span className="font-medium">{result.analysisDetails.aiProbability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Human Probability</span>
                  <span className="font-medium">{result.analysisDetails.humanProbability}%</span>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Indicators</h5>
                  <div className="space-y-2">
                    {result.analysisDetails.indicators.map((indicator, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{indicator.type}</div>
                        <div className="text-gray-600">{indicator.description}</div>
                        <div className="text-gray-500">Confidence: {indicator.confidence}%</div>
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