import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

export interface EmailVerificationProps {
  className?: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ className }) => {
  const { user, sendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [lastSentTime, setLastSentTime] = React.useState<Date | null>(null);

  const canResend = !lastSentTime || Date.now() - lastSentTime.getTime() > 60000; // 1 minute cooldown

  const handleSendVerification = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendVerificationEmail();
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setLastSentTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.emailVerified) {
    return (
      <Card className={className}>
        <div className="flex items-center space-x-3 text-green-600">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>Your email is verified</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Verification</h2>
          <p className="mt-1 text-gray-500">
            Please verify your email address to access all features
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            {successMessage}
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600">
            A verification link will be sent to:{' '}
            <span className="font-medium">{user?.email}</span>
          </p>

          <Button
            onClick={handleSendVerification}
            disabled={isLoading || !canResend}
            className="mt-3"
          >
            {isLoading ? 'Sending...' : 
             !canResend ? `Resend available in ${Math.ceil((60000 - (Date.now() - (lastSentTime?.getTime() || 0))) / 1000)}s` :
             'Send Verification Email'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmailVerification;