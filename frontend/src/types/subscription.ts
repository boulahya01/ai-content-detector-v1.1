export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  tier?: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  price?: number;
  currency?: string;
  features?: string[];
  usage?: {
    current: number;
    limit: number;
  };
}