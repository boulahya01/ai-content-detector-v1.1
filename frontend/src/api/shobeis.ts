import api from '../lib/api';

export interface ShobeisBalance {
  balance: number;
  bonus: number;
  user_type: string;
  monthly_refresh_amount: number;
}

export async function getBalance(): Promise<ShobeisBalance> {
  const response = await api.get('/shobeis/balance');
  return response.data;
}

export interface TransactionResponse {
  transaction_id: string;
  balance: number;
  amount: number;
  balance_before: number;
  balance_after: number;
}

export async function charge(actionType: string, quantity: number = 1, idempotencyKey?: string): Promise<TransactionResponse> {
  const response = await api.post('/shobeis/charge', {
    action_type: actionType,
    quantity,
    idempotency_key: idempotencyKey
  });
  return response.data;
}

export interface CostEstimate {
  cost: number;
  action_type: string;
  quantity: number;
}

export async function estimateCost(actionType: string, quantity: number = 1): Promise<CostEstimate> {
  const response = await api.post('/shobeis/estimate', {
    action_type: actionType,
    quantity
  });
  return response.data;
}

export interface Transaction {
  id: string;
  user_id: string;
  action_type: string;
  amount: number;
  created_at: string;
  balance_before: number;
  balance_after: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
}

export async function getTransactions(limit: number = 50, offset: number = 0): Promise<TransactionHistory> {
  const response = await api.get(`/shobeis/transactions?limit=${limit}&offset=${offset}`);
  return response.data;
}

export interface PurchaseRequest {
  amount: number;
  payment_method_id: string;
  currency?: string;
}

export async function purchase(data: PurchaseRequest): Promise<any> {
  const response = await api.post('/shobeis/purchase', data);
  return response.data;
}