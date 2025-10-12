import RegisterForm from '../components/auth/RegisterForm';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-md w-full space-y-8 card p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">Create your account</h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Or{' '}
            <Link to="/login" className="font-medium text-accent-500 hover:text-accent-600">
              sign in to your account
            </Link>
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}