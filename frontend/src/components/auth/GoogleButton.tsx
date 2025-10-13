interface GoogleButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function GoogleButton({ onClick, className = '' }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-md bg-accent-500 text-white hover:bg-accent-600 transition-colors ${className}`}
    >
      Sign in with Google (coming soon)
    </button>
  );
}
