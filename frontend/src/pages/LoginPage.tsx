import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen auth-container">
      {/* Left Side - Welcome Message */}
      <div className="hidden w-1/2 p-12 lg:flex items-center justify-center">
        <div className="max-w-xl">
          <h1 className="text-7xl font-bold mb-6">
            Welcome Back
          </h1>
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            Continue your journey with AI Content Detector. 
            Access your dashboard and manage your content authenticity with ease.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">Secure Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-black/30 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}