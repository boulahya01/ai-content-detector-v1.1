import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { formStyles } from './styles';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
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
      email: true,
      password: true
    });

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ 
        username: formData.email, 
        password: formData.password 
      });
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          toast.error('Email not found');
        } else if (error.message.includes('password')) {
          toast.error('Incorrect password');
        } else if (error.message.includes('connect')) {
          toast.error('Connection error');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Could not sign in');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
      <h2 className="text-4xl font-bold text-white/90 text-center mb-6">Login</h2>

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
              value={formData.email}
              onChange={handleChange}
              className={`${formStyles.input} ${touched.email && errors.email ? '!border-red-500' : ''}`}

              placeholder="Email Address"
            />
            {touched.email && errors.email && (
              <p className={formStyles.errorText}>{errors.email}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="relative">
            <FiLock className={formStyles.inputIcon} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`${formStyles.input} ${touched.password && errors.password ? '!border-red-500' : ''}`}
              placeholder="Password"
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
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded border border-white/20 bg-white/5 transition-colors 
                  peer-checked:bg-accent-500 peer-checked:border-accent-500 
                  peer-focus:ring-2 peer-focus:ring-accent-500/30
                  group-hover:border-white/30"
                />
                <svg
                  className="absolute left-0 top-0 h-4 w-4 p-[2px] text-white opacity-0 transition-opacity peer-checked:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                Remember me
              </span>
            </label>
            <Link to="/forgot-password" className={formStyles.link}>
              Forgot password?
            </Link>
          </div>
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
            Signing in...
          </div>
        ) : (
          'Sign in'
        )}
      </button>

      <div className="text-center text-sm text-white/70">
        Don't have an account?{' '}
        <Link to="/register" className={formStyles.link}>
          Sign up
        </Link>
      </div>
    </form>
  );
}