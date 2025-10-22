import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FiBell, FiUser, FiSettings, FiLogOut, FiKey, FiCreditCard } from 'react-icons/fi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

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

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors relative">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-gray-900/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel>
                <h3 className="font-medium text-white/90">Notifications</h3>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {/* Example notification */}
              <div className="p-2">
                <div className="p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <p className="text-sm text-white/90">New analysis completed</p>
                  <p className="text-xs text-white/60 mt-1">2 minutes ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                <div className="relative w-8 h-8">
                  <div className="w-full h-full rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-sm font-semibold">
                    {user?.first_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white/90">
                    {user?.first_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-white/60">
                    {user?.credits || 0} credits
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel className="border-b border-white/10">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white/90">{user?.first_name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-white/60">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <div className="p-1">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center text-white/70 hover:text-white hover:bg-white/5 group">
                    <FiUser className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center text-white/70 hover:text-white hover:bg-white/5 group">
                    <FiSettings className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/api-keys" className="flex items-center text-white/70 hover:text-white hover:bg-white/5 group">
                    <FiKey className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
                    API Keys
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/billing" className="flex items-center text-white/70 hover:text-white hover:bg-white/5 group">
                    <FiCreditCard className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
                    Billing
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="p-1">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
 