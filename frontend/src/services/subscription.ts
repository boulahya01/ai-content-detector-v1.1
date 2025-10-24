import { api } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  credits: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

class SubscriptionService {
  async createCheckoutSession(data: CreateCheckoutSessionRequest) {
    const response = await api.post('/api/subscriptions/create-checkout', data);
    return response.data;
  }

  async createPortalSession(data: CreatePortalSessionRequest) {
    const response = await api.post('/api/subscriptions/create-portal', data);
    return response.data;
  }

  async getCurrentSubscription() {
    const response = await api.get('/api/subscriptions/current');
    return response.data;
  }

  async purchaseCredits(packageId: string) {
    const response = await api.post(`/api/credits/purchase/${packageId}`);
    return response.data;
  }

  async getCreditHistory() {
    const response = await api.get('/api/credits/history');
    return response.data;
  }

  async getCurrentCredits() {
    const response = await api.get('/api/credits/balance');
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();