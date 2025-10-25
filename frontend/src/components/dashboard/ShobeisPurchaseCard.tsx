import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ShobeisPurchaseCardProps {
  onPurchase: () => void;
}

export function ShobeisPurchaseCard({ onPurchase }: ShobeisPurchaseCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Purchase Shobeis</h3>
      <Button onClick={onPurchase} className="w-full">
        Buy More Shobeis
      </Button>
    </Card>
  );
}