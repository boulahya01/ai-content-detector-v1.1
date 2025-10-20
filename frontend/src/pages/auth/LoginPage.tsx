import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container relative flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] max-w-lg mx-auto p-4">
      <LoginForm />
    </div>
  );
}