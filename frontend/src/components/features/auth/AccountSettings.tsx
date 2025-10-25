import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { toast } from '../../ui/use-toast';

export interface AccountSettingsProps {
  className?: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear all local storage and state
      localStorage.clear();
      window.location.href = '/';
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-500">Manage your account preferences and security</p>
        </div>

        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your account was created on {' '}
              {new Date(user?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/2fa/setup', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                  });

                  if (!response.ok) {
                    throw new Error('Failed to setup 2FA');
                  }

                  const { qrCode, secret } = await response.json();
                  
                  // Show QR code in modal
                  // For now we'll just save the secret
                  localStorage.setItem('2fa_secret', secret);
                  toast({
                    title: "Success",
                    description: "2FA setup completed"
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to setup 2FA",
                    variant: "destructive"
                  });
                }
              }}
            >
              Enable 2FA
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
            <p className="mt-1 text-sm text-gray-500">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              className="mt-2"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 
               showDeleteConfirm ? 'Click again to confirm' : 
               'Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountSettings;