interface LogoutButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function LogoutButton({ onClick, className = '' }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-800 ${className}`}
    >
      Logout
    </button>
  );
}
