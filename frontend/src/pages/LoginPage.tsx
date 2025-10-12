import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import LoginForm from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <PageLayout title="Welcome back" description="Sign in to your account">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8">
          <LoginForm />
        </Card>
      </div>
    </PageLayout>
  );
}