import React from 'react';

interface ConfidenceIndicatorProps {
  score: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getColor = (score: number, confidence?: 'high' | 'medium' | 'low') => {
    if (score >= 0.8) return confidence === 'high' ? 'bg-red-600' : 'bg-red-400';
    if (score >= 0.6) return confidence === 'high' ? 'bg-orange-600' : 'bg-orange-400';
    if (score >= 0.4) return confidence === 'high' ? 'bg-yellow-600' : 'bg-yellow-400';
    return confidence === 'high' ? 'bg-green-600' : 'bg-green-400';
  };

  const getLabel = (score: number) => {
    if (score >= 0.8) return 'Likely AI Generated';
    if (score >= 0.6) return 'Possibly AI Generated';
    if (score >= 0.4) return 'Uncertain';
    return 'Likely Human Written';
  };

  const sizeClasses = {
    sm: 'h-2 w-20',
    md: 'h-3 w-32',
    lg: 'h-4 w-48',
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={`bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${getColor(score)} h-full rounded-full transition-all duration-500`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium">
          {getLabel(score)} ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  );
};

export default ConfidenceIndicator;