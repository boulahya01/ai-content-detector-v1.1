import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { formStyles } from '@/components/auth/styles';
import * as authApi from '@/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        setError(error.message);
      } else {
        toast.error('Failed to process password reset request');
        setError('Failed to process password reset request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      return (
    <div className="flex min-h-screen auth-container"
      <div className="max-w-md w-full">
        <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white/90 mb-3">Reset Password</h2>
            {!isSubmitted ? (
              <p className="text-white/60">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            ) : (
              <p className="text-white/60">
                Check your email for instructions to reset your password. The link in the email will expire in 1 hour.
              </p>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <div className="relative">
                  <FiMail className={formStyles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`${formStyles.input} ${error ? '!border-red-500' : ''}`}
                    placeholder="Email Address"
                    disabled={isLoading}
                  />
                  {error && (
                    <p className={formStyles.errorText}>{error}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className={formStyles.button}
                style={{ background: 'linear-gradient(90deg, var(--accent-500), var(--accent-600))' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSubmitted(false)}
              className={formStyles.button}
              style={{ background: 'linear-gradient(90deg, var(--accent-500), var(--accent-600))' }}
            >
              Send Again
            </button>
          )}

          <div className="flex items-center justify-center gap-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}