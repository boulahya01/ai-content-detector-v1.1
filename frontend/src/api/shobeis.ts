import api from '@/lib/api';
import type {
  Balance,
  Transaction,
  EstimateRequest,
  EstimateResponse,
  ReferralRequest,
  PurchaseRequest,
  RefundRequest,
} from '@/types/shobeis';

export const shobeisApi = {
  // Balance operations
  getBalance: async () => {
    const response = await api.get<Balance>('/shobeis/balance');
    return response.data;
  },
    
  // Cost estimation
  estimateCost: async (request: EstimateRequest) => {
    const response = await api.post<EstimateResponse>('/shobeis/estimate', request);
    return response.data;
  },
    
  // Transactions
  createTransaction: async (
    type: string,
    params: { 
      word_count?: number;
      file_type?: string;
      is_bulk?: boolean;
      meta?: Record<string, any>;
    }
  ) => {
    const response = await api.post<Transaction>(`/shobeis/transactions/${type}`, params);
    return response.data;
  },
    
  listTransactions: async (params?: {
    limit?: number;
    offset?: number;
    type_filter?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get<Transaction[]>('/shobeis/transactions', { params });
    return response.data;
  },
    
  // Referral system
  createReferral: async (request: ReferralRequest) => {
    const response = await api.post<{ success: boolean; referral_code: string }>(
      '/shobeis/referral', 
      request
    );
    return response.data;
  },
    
  // Purchase and refunds
  purchaseShobeis: async (request: PurchaseRequest) => {
    const response = await api.post<Transaction>('/shobeis/purchase', request);
    return response.data;
  },
    
  refundTransaction: async (request: RefundRequest) => {
    const response = await api.post<Transaction>('/shobeis/refund', request);
    return response.data;
  },
};