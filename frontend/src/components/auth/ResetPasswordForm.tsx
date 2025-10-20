import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { formStyles } from './styles';
import { resetPassword } from '@/api/auth';

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'password':
        if (!value) return 'Password is required';
        const passwordErrors = validatePassword(value);
        return passwordErrors.length > 0 ? passwordErrors[0] : '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key as keyof typeof formData]);
    });
    setErrors(newErrors);
    setTouched({
      password: true,
      confirmPassword: true
    });

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // Validate password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast.error(
        <div>
          <p className="font-medium">Password requirements:</p>
          <ul className="list-disc list-inside">
            {passwordErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token!, formData.password);
      toast.success('Password has been reset successfully', {
        action: {
          label: 'Sign in',
          onClick: () => navigate('/login')
        }
      });
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          toast.error('Reset link has expired', {
            action: {
              label: 'Request new link',
              onClick: () => navigate('/forgot-password')
            }
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Could not reset password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!token) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-white/90 text-center mb-2">Reset Password</h2>
      <p className="text-center text-white/70 mb-6">
        Please choose a strong password for your account.
      </p>

      <div className="space-y-4">
        <div className="form-group">
          <div className="relative">
            <FiLock className={formStyles.inputIcon} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`${formStyles.input} ${touched.password && errors.password ? '!border-red-500' : ''}`}
              placeholder="New Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
            {touched.password && errors.password && (
              <p className={formStyles.errorText}>{errors.password}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="relative">
            <FiLock className={formStyles.inputIcon} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${formStyles.input} ${touched.confirmPassword && errors.confirmPassword ? '!border-red-500' : ''}`}
              placeholder="Confirm New Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className={formStyles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>
          <p className={formStyles.helpText}>
            At least 8 characters with uppercase, lowercase, number & symbol.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || Object.keys(errors).some(key => errors[key]) || Object.keys(formData).some(key => !formData[key as keyof typeof formData])}
        className={formStyles.button}
        style={{ background: 'var(--accent-500)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
            Resetting password...
          </div>
        ) : (
          'Set New Password'
        )}
      </button>
    </form>
  );
}