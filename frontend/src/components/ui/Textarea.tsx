import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  counter?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, counter, maxLength, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    
    return (
      <div className="relative">
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-xl border border-white/10 bg-black text-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-white/50',
            'focus-visible:outline-none focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'hover:border-white/20',
            error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
          maxLength={maxLength}
          value={value}
        />
        <div className="mt-1 flex justify-between">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          {counter && (
            <p className={cn(
              'text-xs text-white/70',
              maxLength && charCount >= maxLength && 'text-red-500',
              error ? 'ml-auto' : ''
            )}>
              {charCount}{maxLength ? `/${maxLength}` : ''} characters
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };