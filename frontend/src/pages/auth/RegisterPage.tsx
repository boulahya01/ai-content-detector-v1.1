import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container relative flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] max-w-lg mx-auto p-4">
      <RegisterForm />
    </div>
  );
}