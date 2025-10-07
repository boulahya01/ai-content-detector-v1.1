import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';

const navigation = [
  { name: 'Home', href: '/', public: true },
  { name: 'Dashboard', href: '/dashboard', public: false },
  { name: 'Analyze', href: '/analyze', public: false },
  { name: 'History', href: '/history', public: false },
  { name: 'Pricing', href: '/pricing', public: true },
  { name: 'Settings', href: '/settings', public: false },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="content-container">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  AI Detector
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                {user ? <span className="text-sm text-gray-700">{user.name}</span> : null}
                <Link to="/analyze" className="text-sm text-indigo-600 hover:text-indigo-500">Analyze</Link>
                {user ? <LogoutButton onClick={logout} /> : <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">Login</Link>}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            if (!item.public && !user) return null;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="content-container py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto">
          <div className="content-container py-12">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} AI Content Detector. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}