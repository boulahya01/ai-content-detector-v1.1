import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function LogoutButton({ onClick, className }: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={className}
    >
      Logout
    </Button>
  );
}
