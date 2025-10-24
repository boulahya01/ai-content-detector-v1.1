import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type TimeFrameOption = '24h' | '7d' | '30d' | 'all';

interface TimeFrameSelectorProps {
  value: TimeFrameOption;
  onChange: (value: TimeFrameOption) => void;
  className?: string;
}

export default function TimeFrameSelector({ value, onChange, className }: TimeFrameSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => onChange(value as TimeFrameOption)}
      className={`flex items-center space-x-4 ${className || ''}`}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="24h" id="24h" />
        <Label htmlFor="24h">24h</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="7d" id="7d" />
        <Label htmlFor="7d">7d</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="30d" id="30d" />
        <Label htmlFor="30d">30d</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="all" />
        <Label htmlFor="all">All</Label>
      </div>
    </RadioGroup>
  );
}