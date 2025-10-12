import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ 
        username: formData.email, 
        password: formData.password 
      });
      toast.success('Login successful!');
      // Use replace to prevent going back to login page
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          toast.error('Email not found. Please check your email or register.');
        } else if (error.message.includes('password')) {
          toast.error('Incorrect password. Please try again.');
        } else if (error.message.includes('connect')) {
          toast.error('Unable to connect to the server. Please check your internet connection.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('An error occurred during login. Please try again.');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="pl-10 w-full"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-white hover:text-white/80"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="pl-10 w-full"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-500">
            Remember me
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        isLoading={isLoading}
      >
        Sign in
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-secondary-500">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleButton className="w-full" />

      <p className="text-center text-sm text-secondary-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-accent-500 hover:text-accent-600"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}