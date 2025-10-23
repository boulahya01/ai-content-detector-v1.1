import { api } from '@/lib/api';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
}

export interface ApiKeyCreate {
  name: string;
}

class ApiKeyService {
  async list(): Promise<ApiKey[]> {
    const response = await api.get('/api/api-keys');
    return response.data;
  }

  async create(key: ApiKeyCreate): Promise<ApiKey> {
    const response = await api.post('/api/api-keys', key);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/api-keys/${id}`);
  }

  async revoke(id: string): Promise<ApiKey> {
    const response = await api.post(`/api/api-keys/${id}/revoke`);
    return response.data;
  }
}

export const apiKeyService = new ApiKeyService();