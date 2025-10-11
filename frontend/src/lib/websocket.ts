import { AnalysisProgress, AnalysisResult } from '@/types/api';

export type AnalysisEventHandler = (event: AnalysisProgress) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, AnalysisEventHandler> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number = 1000; // Start with 1 second

  constructor(private baseUrl: string) {}

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(this.baseUrl.replace(/^http/, 'ws') + '/ws/analysis');

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as AnalysisProgress;
        const handler = this.eventHandlers.get(data.analysisId);
        if (handler) {
          handler(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.reconnectTimeout *= 2; // Exponential backoff
          this.connect();
        }, this.reconnectTimeout);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  subscribeToAnalysis(analysisId: string, handler: AnalysisEventHandler) {
    this.eventHandlers.set(analysisId, handler);
    this.connect();
  }

  unsubscribeFromAnalysis(analysisId: string) {
    this.eventHandlers.delete(analysisId);
    if (this.eventHandlers.size === 0 && this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }
}

// Export a singleton instance
export const wsManager = new WebSocketManager(import.meta.env.VITE_API_URL || '');