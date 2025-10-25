import { toast as toastFn } from '@/components/ui/use-toast';

interface ToastProps {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
  duration?: number;
}

export const toast = {
  success: (message: string) => {
    toastFn({
      title: 'Success',
      description: message,
      variant: 'default',
      className: 'bg-green-50 border-green-200 text-green-900'
    });
  },
  error: (message: string) => {
    toastFn({
      title: 'Error',
      description: message,
      variant: 'destructive'
    });
  },
  info: (message: string) => {
    toastFn({
      title: 'Info',
      description: message,
      variant: 'default'
    });
  },
  custom: (props: ToastProps) => {
    toastFn(props);
  }
}