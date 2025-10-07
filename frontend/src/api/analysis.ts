import api from '@/lib/api';
import { ApiResponse, AnalysisResult } from '@/types/api';

export interface AnalyzeTextRequest {
  content: string;
  options?: {
    language?: string;
    detailed?: boolean;
    threshold?: number;
  };
}

export interface AnalyzeFileRequest {
  file: File;
  options?: {
    language?: string;
    detailed?: boolean;
    threshold?: number;
  };
}

export interface AnalysisHistoryResponse {
  items: AnalysisResult[];
  total: number;
  page: number;
  totalPages: number;
}

export const analysisService = {
  async analyzeText(data: AnalyzeTextRequest): Promise<ApiResponse<AnalysisResult>> {
    try {
      const response = await api.post<ApiResponse<AnalysisResult>>('/analyze', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to analyze text content');
    }
  },

  async analyzeFile(data: AnalyzeFileRequest): Promise<ApiResponse<AnalysisResult>> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.options) {
        formData.append('options', JSON.stringify(data.options));
      }
      
      const response = await api.post<ApiResponse<AnalysisResult>>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to analyze file content');
    }
  },

  async getHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<AnalysisHistoryResponse>> {
    try {
      const response = await api.get<ApiResponse<AnalysisHistoryResponse>>('/history', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analysis history');
    }
  },

  async getAnalysisById(id: string): Promise<ApiResponse<AnalysisResult>> {
    try {
      const response = await api.get<ApiResponse<AnalysisResult>>(`/analyze/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analysis details');
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      await api.delete(`/history/${id}`);
    } catch (error) {
      throw new Error('Failed to delete history item');
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await api.delete('/history');
    } catch (error) {
      throw new Error('Failed to clear history');
    }
  }
};