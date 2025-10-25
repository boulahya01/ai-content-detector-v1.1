import { useContext } from 'react';
import { useShobeisContext } from '@/context/ShobeisContext';

export function useShobeis() {
  const context = useShobeisContext();
  
  if (!context) {
    throw new Error('useShobeis must be used within a ShobeisProvider');
  }
  
  return context;
}