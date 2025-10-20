import { useContext } from 'react';
import { ShobeisContext } from '@/context/ShobeisContext';

export function useShobeis() {
  const context = useContext(ShobeisContext);
  
  if (!context) {
    throw new Error('useShobeis must be used within a ShobeisProvider');
  }
  
  return context;
}