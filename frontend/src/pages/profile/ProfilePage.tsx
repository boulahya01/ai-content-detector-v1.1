import ProfileLayout from '@/components/profile/ProfileLayout';
import AccountSettings from '@/components/profile/AccountSettings';

export default function ProfilePage() {
  return (
    <ProfileLayout
      title="Account Settings"
      description="Manage your account settings and preferences"
    >
      <AccountSettings />
    </ProfileLayout>
  );
}