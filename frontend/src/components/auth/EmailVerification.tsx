import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { formStyles } from './styles';
import { verifyEmail, resendVerification } from '@/api/auth';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { token } = useParams<{ token?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
    }
  }, [token]);

  const verifyToken = async () => {
    setIsLoading(true);
    try {
      const response = await verifyEmail(token!);
      setStatus('success');
      toast.success(response.message || 'Email verified successfully');
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Could not verify email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await resendVerification();
      toast.success(response.message || 'Verification email sent');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Could not resend verification email');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-white/90 text-center mb-2">
        {status === 'verifying' ? 'Verifying Email...' :
         status === 'success' ? 'Email Verified!' :
         'Verification Failed'}
      </h2>
      
      <div className="text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-t-4 border-b-4 border-accent-300 rounded-full animate-spin"></div>
            <p className="text-white/70">Please wait while we verify your email...</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white/90">Your email has been verified successfully!</p>
            <p className="text-white/70">You will be redirected to the dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white/90">Could not verify your email.</p>
            <p className="text-white/70">The verification link may be invalid or expired.</p>
            
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={formStyles.button}
              style={{ background: 'var(--accent-500)' }}
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Resend Verification Email'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}