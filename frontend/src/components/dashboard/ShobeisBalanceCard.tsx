import React from 'react';
import { Card } from '@/components/ui/Card';

interface ShobeisBalanceCardProps {
  balance: number;
}

export function ShobeisBalanceCard({ balance }: ShobeisBalanceCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">Shobeis Balance</h3>
      <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-1">Available Shobeis</p>
    </Card>
  );
}