import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (code: string) => void;
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState('EN');

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('language', code);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}