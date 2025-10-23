import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FiDownload, FiRefreshCw, FiShare2 } from 'react-icons/fi';
import 'react-circular-progressbar/dist/styles.css';

interface Indicator {
  type: string;
  description: string;
  confidence: number;
}

interface AnalysisResultProps {
  result: {
    authenticityScore: number;
    aiProbability: number;
    confidenceLevel?: 'high' | 'medium' | 'low';
    indicators?: Indicator[];
  };
  onDownload?: () => void;
  onShare?: () => void;
  onRetry?: () => void;
}

const ConfidenceBadge: React.FC<{ level?: 'high' | 'medium' | 'low' }> = ({ level }) => {
  const colors = {
    high: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-red-500/20 text-red-400'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${level ? colors[level] : 'bg-white/10 text-white/60'}`}>
      {level ? `${level.charAt(0).toUpperCase()}${level.slice(1)} Confidence` : 'Unknown Confidence'}
    </span>
  );
};

export default function AnalysisResult({ result, onDownload, onShare, onRetry }: AnalysisResultProps) {
  const { authenticityScore, aiProbability, confidenceLevel, indicators = [] } = result;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';  // Green
    if (score >= 60) return '#eab308';  // Yellow
    return '#ef4444';  // Red
  };

  return (
    <div className="space-y-6">
      {/* Score Section */}
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white/90">Analysis Result</h3>
          <ConfidenceBadge level={confidenceLevel} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Authenticity Score */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/60">Authenticity Score</p>
            <div className="w-32 h-32 mx-auto">
              <CircularProgressbar
                value={authenticityScore}
                text={`${Math.round(authenticityScore)}%`}
                styles={buildStyles({
                  pathColor: getScoreColor(authenticityScore),
                  textColor: getScoreColor(authenticityScore),
                  trailColor: '#ffffff10'
                })}
              />
            </div>
          </div>

          {/* AI Probability */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/60">AI Detection</p>
            <div className="w-32 h-32 mx-auto">
              <CircularProgressbar
                value={aiProbability}
                text={`${Math.round(aiProbability)}%`}
                styles={buildStyles({
                  pathColor: getScoreColor(100 - aiProbability),
                  textColor: getScoreColor(100 - aiProbability),
                  trailColor: '#ffffff10'
                })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              New Analysis
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download Report
            </button>
          )}
        </div>
      </div>

      {/* Indicators Section */}
      {indicators.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-6">
          <h3 className="text-lg font-medium text-white/90 mb-4">Analysis Indicators</h3>
          <div className="space-y-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-16 h-2 mt-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${indicator.confidence * 100}%`,
                      backgroundColor: getScoreColor(indicator.confidence * 100)
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{indicator.type}</p>
                  <p className="text-sm text-white/60">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}