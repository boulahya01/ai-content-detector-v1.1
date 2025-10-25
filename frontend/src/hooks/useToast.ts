import { toast } from '@/components/ui/use-toast';
import type { ToastOptions } from '@radix-ui/react-toast';

export function useToast() {
  return {
    toast: (props: ToastOptions) => toast(props)
  };
}

export default useToast;
