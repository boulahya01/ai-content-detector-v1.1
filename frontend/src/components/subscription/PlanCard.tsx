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
      'relative rounded-lg border p-6',
      isPopular 
        ? 'bg-black/40 border-accent-500' 
        : 'bg-black/20 border-white/10',
      comingSoon && 'opacity-75'
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-accent-500/90 text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-white/70">{description}</p>
        )}
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-4xl font-bold text-white">{price}</span>
          {period && (
            <span className="ml-1 text-lg text-white/70">/{period}</span>
          )}
        </div>
      </div>

      {creditsPerMonth && (
        <div className="mt-6 pb-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/90">Monthly Credits</span>
            <span className="text-xl font-semibold text-accent-500">{creditsPerMonth}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-accent-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(creditsPerMonth / 1000) * 100}%` }}
            />
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start"
            title={feature.tooltip}
          >
            <span className={cn(
              'flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2',
              feature.included ? 'text-accent-500' : 'text-white/30'
            )}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </span>
            <span className={cn(
              'text-sm',
              feature.included ? 'text-white/90' : 'text-white/40 line-through'
            )}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          'w-full mt-6',
          isPopular ? 'bg-accent-500 hover:bg-accent-600' : 'bg-white/10 hover:bg-white/20',
          'text-white font-medium'
        )}
        disabled={comingSoon}
        onClick={onSelect}
      >
        {comingSoon ? 'Coming Soon' : buttonText}
      </Button>
    </div>
  );
}
