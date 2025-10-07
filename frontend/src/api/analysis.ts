import api from '@/lib/api';
import { ApiResponse, AnalysisResult } from '@/types/api';
import type { AxiosProgressEvent } from 'axios';

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
    } catch {
      throw new Error('Failed to analyze text content');
    }
  },

  async analyzeFile(
    file: File,
    options?: AnalyzeFileRequest['options'],
    onUploadProgress?: (percent: number) => void
  ): Promise<ApiResponse<AnalysisResult>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await api.post<ApiResponse<AnalysisResult>>('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (!onUploadProgress) return;
          const loaded = progressEvent.loaded ?? 0;
          const total = progressEvent.total ?? 0;
          if (total > 0) {
            const percent = Math.round((loaded * 100) / total);
            onUploadProgress(percent);
          }
        },
      });
      return response.data as ApiResponse<AnalysisResult>;
    } catch (error: any) {
      console.error('File analysis error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to analyze file content'
      );
    }
  },

  async getHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<AnalysisHistoryResponse>> {
    try {
      const response = await api.get<ApiResponse<AnalysisHistoryResponse>>('/history', {
        params: { page, limit },
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch analysis history');
    }
  },

  async getAnalysisById(id: string): Promise<ApiResponse<AnalysisResult>> {
    try {
      const response = await api.get<ApiResponse<AnalysisResult>>(`/analyze/${id}`);
      return response.data;
    } catch {
      throw new Error('Failed to fetch analysis details');
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      await api.delete(`/history/${id}`);
    } catch {
      throw new Error('Failed to delete history item');
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await api.delete('/history');
    } catch {
      throw new Error('Failed to clear history');
    }
  }
};