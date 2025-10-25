export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: 'user' | 'admin' | 'pro';
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  credits: number;
  is_active: boolean;
  avatar?: string;
  avatarUrl?: string;
  subscription?: any;
  company?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}