import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from './ui/Loading';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  allowTrial?: boolean;
}

export function PrivateRoute({ 
  children, 
  requireVerified = false,
  allowTrial = false 
}: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Not logged in - redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Email verification check
  if (requireVerified && !user.is_active) {
    return <Navigate to="/verify-email" state={{ from: location.pathname }} replace />;
  }

  // Pro access check
  if (!allowTrial && location.pathname.includes('/pro') && (!user.role || user.role === 'user')) {
    return <Navigate to="/pricing" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}