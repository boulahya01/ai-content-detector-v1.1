import { api } from '@/lib/api';

export interface NotificationPreferences {
  email: {
    analysisResults: boolean;
    accountActivity: boolean;
    marketingUpdates: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    analysisComplete: boolean;
    subscriptionUpdates: boolean;
    creditAlerts: boolean;
    newFeatures: boolean;
  };
}

class NotificationService {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/api/notifications/preferences');
    return response.data;
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await api.put('/api/notifications/preferences', preferences);
    return response.data;
  }
}

export const notificationService = new NotificationService();