"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('la-casa-language');
  if (stored === 'en' || stored === 'es') return stored;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return langs.some(l => l.toLowerCase().startsWith('es')) ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('la-casa-language', lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    // Simple translation function - in a real app, you'd use a proper i18n library
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Import translations
import { translations } from '../lib/translations';