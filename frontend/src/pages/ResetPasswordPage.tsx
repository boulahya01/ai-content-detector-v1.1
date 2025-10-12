import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, formData.password);
      // Redirect to login with success message
      navigate('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            Invalid Reset Link
          </h3>
          <p className="mt-2 text-gray-600">
            The password reset link is invalid or has expired.
          </p>
          <div className="mt-6">
            <Button
              type="button"
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              className="mt-1"
              placeholder="Enter your new password"
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              className="mt-1"
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            Reset Password
          </Button>

          <div className="text-sm text-center">
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Back to login
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}