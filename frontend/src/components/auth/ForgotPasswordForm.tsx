import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiMail } from 'react-icons/fi';
import { formStyles } from './styles';
import { forgotPassword } from '@/api/auth';

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast.success(
        'Password reset instructions have been sent to your email',
        {
          duration: 6000,
          action: {
            label: 'Back to login',
            onClick: () => navigate('/login')
          }
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Could not process your request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-white/90 text-center mb-2">Reset Password</h2>
      <p className="text-center text-white/70 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <div className="space-y-4">
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
              onChange={(e) => setEmail(e.target.value)}
              className={`${formStyles.input} ${touched && error ? '!border-red-500' : ''}`}
              placeholder="Email Address"
            />
            {touched && error && (
              <p className={formStyles.errorText}>{error}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !email}
        className={formStyles.button}
        style={{ background: 'var(--accent-500)' }}
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

      <div className="text-center text-sm text-white/70">
        Remember your password?{' '}
        <Link to="/login" className={formStyles.link}>
          Back to login
        </Link>
      </div>
    </form>
  );
}