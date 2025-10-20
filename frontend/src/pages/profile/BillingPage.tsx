import ProfileLayout from '@/components/profile/ProfileLayout';
import BillingManager from '@/components/profile/BillingManager';

export default function BillingPage() {
  return (
    <ProfileLayout
      title="Billing & Subscription"
      description="Manage your subscription plan and billing information"
    >
      <BillingManager />
    </ProfileLayout>
  );
}