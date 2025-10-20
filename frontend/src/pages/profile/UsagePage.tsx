import ProfileLayout from '@/components/profile/ProfileLayout';
import UsageStats from '@/components/profile/UsageStats';

export default function UsagePage() {
  return (
    <ProfileLayout
      title="Usage Statistics"
      description="Track your analysis usage and credit consumption"
    >
      <UsageStats />
    </ProfileLayout>
  );
}