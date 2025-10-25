import { Button } from "@/components/ui/Button";

interface GoogleButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function GoogleButton({ onClick, className }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className={className}
    >
      Sign in with Google (coming soon)
    </Button>
  );
}
