import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { EnglishFlagIcon, TurkishFlagIcon } from './ui';

const languages = [
  { code: 'en', name: 'English', Icon: EnglishFlagIcon },
  { code: 'tr', name: 'Türkçe', Icon: TurkishFlagIcon },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const CurrentLanguageIcon = languages.find(l => l.code === language)?.Icon || EnglishFlagIcon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        className="p-2 rounded-full bg-[rgba(var(--color-bg-secondary),0.5)] text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))]]"
      >
        <CurrentLanguageIcon className="w-5 h-5 rounded-full" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-[rgb(var(--color-bg-panel))] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <ul className="py-1">
            {languages.map(({ code, name, Icon }) => (
              <li key={code}>
                <button
                  onClick={() => {
                    setLanguage(code as 'en' | 'tr');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                    language === code
                      ? 'font-semibold text-[rgb(var(--color-text-primary))] bg-[rgba(var(--color-bg-secondary),0.7)]'
                      : 'text-[rgb(var(--color-text-secondary))]'
                  } hover:bg-[rgba(var(--color-bg-secondary),0.7)] hover:text-[rgb(var(--color-text-primary))]`}
                >
                  <Icon className="w-5 h-5 rounded-full" />
                  <span>{name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
