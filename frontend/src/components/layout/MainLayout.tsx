import { ReactNode } from 'react';
import { Header } from './Header';
import { NavigationMenu } from './NavigationMenu';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Show minimal layout for auth pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {children}
      </div>
    );
  }

  // Show full layout with navigation for authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <NavigationMenu />

          {/* Main Content */}
          <div className="flex-1">
            <Header />
            <main className="px-4 py-4 md:px-6 md:py-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Show simplified layout for unauthenticated users on public pages
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
 