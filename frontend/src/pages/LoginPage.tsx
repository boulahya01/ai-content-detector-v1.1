import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleButton from '@/components/auth/GoogleButton';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import '@/styles/flip-card.css';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement login logic here
      console.log('Login attempt with:', { email, password });
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement registration logic here
      console.log('Registration attempt with:', registerData);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl shadow-indigo-100/20 sm:rounded-xl sm:px-10 border border-indigo-50 auth-card">
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-semibold mb-6">Sign In</h2>
                  {error && (
                    <div className="text-red-600 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <div className="relative">
                      <FiMail className="input-icon" aria-hidden="true" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="input-icon" aria-hidden="true" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </div>

                  <div className="divider">
                    <span>Or continue with</span>
                  </div>

                  <button
                    type="button"
                    className="google-btn"
                    onClick={() => { console.log('Google sign-in (placeholder)'); }}
                  >
                    <FcGoogle className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto"
                      onClick={() => setIsFlipped(true)}
                    >
                      <FiUserPlus className="w-4 h-4" />
                      <span>Don't have an account? Sign up</span>
                    </button>
                  </div>
                </form>
            </div>
            <div className="flip-card-back bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl shadow-indigo-100/20 sm:rounded-xl sm:px-10 border border-indigo-50 auth-card">
                <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                  <h3 className="text-xl font-semibold mb-6">Create Account</h3>
                  {error && (
                    <div className="text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="input-icon" aria-hidden="true" />
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Username
                    </label>
                    <div className="relative">
                      <FiUser className="input-icon" aria-hidden="true" />
                      <Input
                        id="register-username"
                        name="username"
                        type="text"
                        required
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Email address
                    </label>
                    <div className="relative">
                      <FiMail className="input-icon" aria-hidden="true" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="input-icon" aria-hidden="true" />
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        required
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto"
                      onClick={() => setIsFlipped(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Already have an account? Sign in</span>
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}