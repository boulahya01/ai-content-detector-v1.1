import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
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
            Welcome to AI Content Detector
          </h1>
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            Join our community of content creators and ensure the authenticity of your content. 
            Get started with powerful AI detection tools and take control of your content strategy.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">Free Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">Real-time Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 bg-black/30 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}