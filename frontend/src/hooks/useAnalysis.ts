import { useState, useCallback } from 'react';
import { useAnalysis as useAnalysisContext } from '@/context/AnalysisContext';
import type { AnalysisResult } from '@/types/api';

export interface UseAnalysisOptions {
  onSuccess?: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
}

interface FilterOptions {
  filter?: 'all' | 'ai-detected' | 'human-written';
  timeRange?: 'all-time' | 'today' | 'this-week' | 'this-month';
}

export function useAnalysis(options: UseAnalysisOptions = {}) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const context = useAnalysisContext();

  const analyzeText = useCallback(async (text: string): Promise<AnalysisResult | void> => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await context.analyzeText(text);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [context.analyzeText, onSuccess, onError]);

  const analyzeFile = useCallback(async (file: File): Promise<AnalysisResult | void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await context.analyzeFile(file);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [context.analyzeFile, onSuccess, onError]);

  const getHistory = useCallback(async (options?: FilterOptions) => {
    setLoading(true);
    try {
      const results = await context.fetchHistory(options);
      return results;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context.fetchHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await context.deleteHistoryItem(id);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context.deleteHistoryItem]);

  const clearHistory = useCallback(async () => {
    setLoading(true);
    try {
      await context.clearHistory();
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context.clearHistory]);

  const getAnalysisById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await context.fetchAnalysisById(id);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context.fetchAnalysisById]);

  return {
    loading,
    error,
    analyzeText,
    analyzeFile,
    getHistory,
    deleteHistoryItem,
    clearHistory,
    getAnalysisById,
    results: context.analysisHistory,
    currentAnalysis: context.currentAnalysis,
  };
}