import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Settings,
  Key,
  CreditCard,
  LogOut
} from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors">
          <div className="relative w-8 h-8">
            <div className="w-full h-full rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-sm font-semibold">
              {user?.email ? getInitials(user.email.split('@')[0]) : '?'}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white/90">
              {user?.email ? user.email.split('@')[0] : 'User'}
            </p>
            <p className="text-xs text-white/60">
              {user?.credits || 0} credits
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-xl" align="end" forceMount>
        <DropdownMenuLabel className="p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white/90 leading-none">{user?.email?.split('@')[0]}</p>
            <p className="text-xs leading-none text-white/60">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center text-white/70 hover:text-white group">
              <User className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center text-white/70 hover:text-white group">
              <Settings className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/api-keys" className="flex items-center text-white/70 hover:text-white group">
              <Key className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
              API Keys
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/billing" className="flex items-center text-white/70 hover:text-white group">
              <CreditCard className="mr-2 h-4 w-4 text-white/60 group-hover:text-white" />
              Billing
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <div className="p-1">
          <DropdownMenuItem 
            className="flex items-center cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}