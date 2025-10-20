import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="container relative flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] max-w-lg mx-auto p-4">
      <ResetPasswordForm />
    </div>
  );
}