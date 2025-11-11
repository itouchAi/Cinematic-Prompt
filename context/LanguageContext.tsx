import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'tr';

// A helper function to safely access nested keys like 'header.title'
const getNestedTranslation = (obj: any, key: string) => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: any[]) => string;
}

export const LanguageContext = createContext<LanguageContextType>(null!);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const storedLang = localStorage.getItem('language');
      return (storedLang === 'en' || storedLang === 'tr') ? storedLang : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    } catch (e) {
      console.error("Could not save language to localStorage", e);
    }
  }, [language]);

  const t = useCallback((key: string, ...args: any[]): string => {
    const translationSet = translations[language] || translations.en;
    const value = getNestedTranslation(translationSet, key);
    
    if (typeof value === 'function') {
      return value(...args);
    }

    if (typeof value === 'string') {
      return value;
    }
    
    // Fallback to English if key not found in current language
    const fallbackValue = getNestedTranslation(translations.en, key);
    if (typeof fallbackValue === 'function') {
      return fallbackValue(...args);
    }
    if (typeof fallbackValue === 'string') {
      return fallbackValue;
    }

    return key; // Return the key itself if not found anywhere
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
