import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import * as authApi from '../api/auth';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const message = location.state?.message;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleResendVerification = async () => {
    try {
      await authApi.resendVerification();
      toast.success('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <FiMail className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message || `We sent a verification email to ${email}. Please check your inbox and click the verification link to activate your account.`}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleResendVerification}
            className="w-full"
          >
            Resend verification email
          </Button>

          <Link to="/login">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              click here to resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}