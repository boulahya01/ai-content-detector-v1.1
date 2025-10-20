import ProfileLayout from '@/components/profile/ProfileLayout';
import ApiKeysManager from '@/components/profile/ApiKeysManager';

export default function ApiKeysPage() {
  return (
    <ProfileLayout
      title="API Keys"
      description="Generate and manage API keys for programmatic access to our services"
    >
      <ApiKeysManager />
    </ProfileLayout>
  );
}