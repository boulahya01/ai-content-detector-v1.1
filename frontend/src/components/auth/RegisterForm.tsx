import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { formStyles } from './styles';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
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
      fullName: true,
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

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await register({
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName
      });
      
      toast.success('Welcome! Your account is ready.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
          if (error.message.includes('already registered')) {
          toast.error('Email already registered', {
            action: {
              label: 'Sign in',
              onClick: () => navigate('/login')
            }
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Could not create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'fullName':
        if (!value) return 'Full name is required';
        if (value.length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Full name can only contain letters and spaces';
        return '';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white/90 text-center mb-6">Create Account</h2>

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
            <FiUser className={formStyles.inputIcon} />
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className={`${formStyles.input} ${touched.fullName && errors.fullName ? '!border-red-500' : ''}`}
              placeholder="Full Name"
            />
            {touched.fullName && errors.fullName && (
              <p className={formStyles.errorText}>{errors.fullName}</p>
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
              placeholder="Confirm Password"
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
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
          {(errors.password || errors.confirmPassword) && (
            <p className={formStyles.helpText}>
              At least 8 characters with 1 number & symbol.
            </p>
          )}
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
            Signing up...
          </div>
        ) : (
          'Sign up'
        )}
      </button>

      <div className="text-center text-sm text-white/70">
        Already have an account?{' '}
        <Link to="/login" className={formStyles.link}>
          Sign in
        </Link>
      </div>
    </form>
  );
}