import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import { formStyles } from '../auth/styles';

export default function AccountSettings() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      toast.success('Password updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
  <div className="space-y-6 text-sm">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-semibold text-white/90 mb-3">Basic Information</h3>
        <form onSubmit={handleBasicInfoSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-group">
              <div className="relative">
                <FiUser className={formStyles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${formStyles.input} py-2 pl-9 pr-3 text-sm rounded-lg`}
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="relative">
                <FiMail className={formStyles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${formStyles.input} py-2 pl-9 pr-3 text-sm rounded-lg`}
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={formStyles.button}
              style={{ background: 'var(--accent-500)', padding: '8px 14px', fontSize: '14px' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div>
        <h3 className="text-base font-semibold text-white/90 mb-3">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-group md:col-span-2">
              <div className="relative">
                <FiLock className={formStyles.inputIcon} />
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`${formStyles.input} py-2 pl-9 pr-3 text-sm rounded-lg`}
                  placeholder="Current Password"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="relative">
                <FiLock className={formStyles.inputIcon} />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`${formStyles.input} py-2 pl-9 pr-3 text-sm rounded-lg`}
                  placeholder="New Password"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="relative">
                <FiLock className={formStyles.inputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${formStyles.input} py-2 pl-9 pr-3 text-sm rounded-lg`}
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={formStyles.button}
              style={{ background: 'var(--accent-500)', padding: '8px 14px', fontSize: '14px' }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-base font-semibold text-red-500 mb-3">Danger Zone</h3>
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
          <p className="text-sm text-white/70 mb-3">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            type="button"
            className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}