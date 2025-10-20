import { Link } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { FiBell, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">AI Content Detector</span>
          </Link>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-gray-900/95 backdrop-blur-xl">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-8">
            <span className="text-lg font-bold text-white">THE AI DETECTOR</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/analysis/new" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Analysis
            </Link>
            <Link to="/analysis/history" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              History
            </Link>
          </nav>
        </div>

        {/* Right side - Language, Credits and User menu */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors relative"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-lg z-30">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-medium text-white/90">Notifications</h3>
                  </div>
                  <div className="p-2">
                    {/* Example notification */}
                    <div className="p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <p className="text-sm text-white/90">New analysis completed</p>
                      <p className="text-xs text-white/60 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="relative w-8 h-8">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-sm font-semibold">
                    {user?.first_name?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white/90">
                  {user?.first_name || 'User'}
                </p>
                <p className="text-xs text-white/60">
                  {user?.credits || 0} credits
                </p>
              </div>
              <FiChevronDown className={cn(
                'w-4 h-4 transition-transform',
                isDropdownOpen ? 'rotate-180' : ''
              )} />
            </button>

            {/* User Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-lg z-30">
                  <div className="p-2">
                    <div className="px-2 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white/90">
                        {user?.first_name || 'User'}
                      </p>
                      <p className="text-xs text-white/60">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="py-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
 