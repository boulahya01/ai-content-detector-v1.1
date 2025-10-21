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
  // mark this as a non-billable test analysis (frontend set to true for interactive tests)
  is_test?: boolean;
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
      // Use the explicit API prefix to match backend router (frontend baseURL may include /api)
      const response = await api.post<ApiResponse<AnalysisResult>>('/api/analyze', data);
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      console.error('Text analysis error', { status, respData, message: err.message });
      throw new Error(respData?.message || respData?.error || 'Failed to analyze text content');
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

  const response = await api.post<ApiResponse<AnalysisResult>>('/api/analyze', formData, {
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
  const response = await api.get<ApiResponse<AnalysisHistoryResponse>>('/api/history', {
        params: { page, limit },
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch analysis history');
    }
  },

  async getAnalysisById(id: string): Promise<ApiResponse<AnalysisResult>> {
    try {
  const response = await api.get<ApiResponse<AnalysisResult>>(`/api/analyze/${id}`);
      return response.data;
    } catch {
      throw new Error('Failed to fetch analysis details');
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
  await api.delete(`/api/history/${id}`);
    } catch {
      throw new Error('Failed to delete history item');
    }
  },

  async clearHistory(): Promise<void> {
    try {
  await api.delete('/api/history');
    } catch {
      throw new Error('Failed to clear history');
    }
  }
};