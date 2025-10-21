
import { useShobeis } from '@/hooks/useShobeis';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export function CreditsDisplay() {
  const { balance, monthlyBalance } = useShobeis();

  return (
    <Link to="/shobeis">
      <Button
        variant="outline"
        size="sm"
        className="text-purple-500 border-purple-200 hover:bg-purple-50 hover:text-purple-600"
      >
        {monthlyBalance} Monthly / {balance} Main Credits
      </Button>
    </Link>
  );
}