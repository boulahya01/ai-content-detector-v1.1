import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleButton from '@/components/auth/GoogleButton';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  // Placeholder: Google OAuth integration goes here

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome to AI Content Detector
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to analyze your content and detect AI-generated text
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Sign in with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleButton onClick={() => { console.log('Google sign-in (placeholder)'); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}