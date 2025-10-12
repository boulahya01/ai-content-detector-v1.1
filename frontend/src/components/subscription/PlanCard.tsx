import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';

interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

interface PlanCardProps {
  title: string;
  price: string;
  period?: string;
  description?: string;
  features: PlanFeature[];
  isPopular?: boolean;
  creditsPerMonth?: number;
  comingSoon?: boolean;
  buttonText?: string;
  onSelect?: () => void;
}

export default function PlanCard({
  title = 'Coming soon',
  price = '$0',
  period = 'month',
  description,
  features = [],
  isPopular = false,
  creditsPerMonth,
  comingSoon = false,
  buttonText = 'Get Started',
  onSelect
}: PlanCardProps) {
  return (
    <div className={cn(
      'relative rounded-2xl border p-8 transition-all duration-200',
      'hover:border-blue-500 hover:shadow-lg',
      isPopular && 'border-blue-500 shadow-xl',
      comingSoon && 'opacity-75'
    )}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-5xl font-extrabold tracking-tight text-gray-900">{price}</span>
          {period && (
            <span className="ml-1 text-xl font-semibold text-gray-500">/{period}</span>
          )}
        </div>
      </div>

      {creditsPerMonth && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Monthly Credits</span>
            <span className="text-2xl font-bold text-blue-600">{creditsPerMonth}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(creditsPerMonth / 1000) * 100}%` }}
            />
          </div>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start"
            title={feature.tooltip}
          >
            <span className={cn(
              'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3',
              feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            )}>
              {feature.included ? '✓' : '×'}
            </span>
            <span className={cn(
              'text-base',
              feature.included ? 'text-gray-900' : 'text-gray-500 line-through'
            )}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          'w-full mt-8',
          isPopular && 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        )}
        disabled={comingSoon}
        onClick={onSelect}
      >
        {comingSoon ? 'Coming Soon' : buttonText}
      </Button>
    </div>
  );
}
