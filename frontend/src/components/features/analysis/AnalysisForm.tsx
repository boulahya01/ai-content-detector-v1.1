import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import type { AnalysisResult } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
  initialText?: string;
}

const sanitize = (input: string) => input.replace(/\s+$/g, '');

// Mirror free-plan limit used on HomePage
const FREE_CHAR_LIMIT = 2000;

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onAnalysisComplete,
  onError,
  initialText = ''
}) => {
  const [content, setContent] = useState(initialText || '');
  const { analyzeText, isLoading } = useAnalyzer({
    onSuccess: (res) => onAnalysisComplete(res),
    onError: (err) => onError?.(err),
  });

  const { user } = useAuth();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitize(content || '');
    if (!cleaned.trim()) return;

    try {
      const result = await analyzeText(cleaned);
      if (result) {
        // onSuccess already calls onAnalysisComplete via hook option
      }
    } catch {
      // error handled by hook
    }
  }, [content, analyzeText]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => {
          let v = e.target.value || '';
          // enforce free limit for anonymous users
          if (!user && v.length > FREE_CHAR_LIMIT) {
            v = v.slice(0, FREE_CHAR_LIMIT);
          }
          setContent(v);
        }}
        placeholder="Paste your text here to analyze..."
        rows={8}
        required
      />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className={content.length >= FREE_CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'}>
          {content.length} / {FREE_CHAR_LIMIT} chars
        </div>
        {content.length >= FREE_CHAR_LIMIT && (
          <div className="text-red-600">Free limit reached — log in or upgrade to analyze longer content.</div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Text'}
      </Button>
    </form>
  );
};

export default AnalysisForm;