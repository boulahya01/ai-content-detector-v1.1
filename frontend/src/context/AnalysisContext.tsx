import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnalysisResult } from '@/types/api';
import { analysisService } from '@/api/analysis';

interface AnalysisContextType {
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isAnalyzing: boolean;
  error: Error | null;
  analyzeText: (text: string) => Promise<AnalysisResult>;
  analyzeFile: (file: File) => Promise<AnalysisResult>;
  clearCurrentAnalysis: () => void;
  fetchHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: React.ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeText = useCallback(async (content: string): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await analysisService.analyzeText({ content });
      const result = response.data;
      setCurrentAnalysis(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeFile = useCallback(async (file: File): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await analysisService.analyzeFile({ file });
      const result = response.data;
      setCurrentAnalysis(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await analysisService.getHistory();
      setAnalysisHistory(response.data.items);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await analysisService.deleteHistoryItem(id);
      setAnalysisHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const value = {
    currentAnalysis,
    analysisHistory,
    isAnalyzing,
    error,
    analyzeText,
    analyzeFile,
    clearCurrentAnalysis,
    fetchHistory,
    deleteHistoryItem,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisProvider;