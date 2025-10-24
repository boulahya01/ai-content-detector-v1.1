import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  className = ''
}: StatsCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-3xl font-bold text-accent-500">
        {value}
      </div>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  );
}