import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="content-container py-8">
      <div className="max-w-3xl mx-auto card">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Profile Information</h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/70">Email</label>
              <p className="mt-1 text-white">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <label className="text-sm font-medium text-white/70">Name</label>
                <p className="mt-1 text-white">{user.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-white/70">Member Since</label>
              <p className="mt-1 text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}