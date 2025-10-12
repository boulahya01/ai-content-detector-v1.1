import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/utils/cn';

// Button component props are defined in ButtonProps interface below

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[color:var(--accent-500)] text-white hover:bg-[color:var(--accent-600)] active:transform active:scale-98',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        outline:
          'border border-white bg-transparent text-white hover:bg-white/10',
        secondary:
          'bg-white/6 text-white hover:bg-white/10 active:bg-white/12',
        ghost: 'hover:bg-white/10 text-white',
        link: 'text-white underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-xl',
        sm: 'h-9 px-3 rounded-lg text-sm',
        lg: 'h-12 px-8 rounded-xl text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    isLoading = false, 
    asChild = false, 
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={!asChild ? (isLoading || props.disabled) : undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };