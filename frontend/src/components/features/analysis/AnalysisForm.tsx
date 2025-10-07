import React, { useState } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { analysisService } from '@/api/analysis';
import type { AnalysisResult } from '@/types/api';

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onAnalysisComplete,
  onError
}) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await analysisService.analyzeText({ content });
      onAnalysisComplete(response.data);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your text here to analyze..."
        rows={8}
        required
      />
      <Button
        type="submit"
        disabled={isAnalyzing || !content.trim()}
        className="w-full"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
      </Button>
    </form>
  );
};

export default AnalysisForm;