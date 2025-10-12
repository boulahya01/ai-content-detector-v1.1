import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            'flex h-10 w-full rounded-md border bg-[color:var(--surface-500)] px-3 py-2 text-sm transition-colors duration-200',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'text-[color:var(--text-100)] placeholder:text-white/50',
            'focus-visible:outline-none focus-visible:border-[color:var(--accent-500)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-500)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'hover:border-[color:var(--accent-500)]',
            error && 'border-[color:var(--accent-500)] focus-visible:border-[color:var(--accent-500)] focus-visible:ring-[color:var(--accent-500)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };