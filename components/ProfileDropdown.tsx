import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { ClockIcon, UserIcon, HeartIcon, SparklesIcon } from './ui';

const ProfileDropdown: React.FC = () => {
  const { currentUser, logout, setAppView } = useContext(AuthContext);
  const { t } = useTranslation();
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

  if (!currentUser) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
      >
        <UserIcon className="w-6 h-6 p-1 rounded-full bg-[rgba(var(--color-bg-secondary),0.5)]" />
        <span className="font-medium text-[rgb(var(--color-text-primary))] hidden sm:block">{currentUser.nickname}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-2 w-48 bg-[rgb(var(--color-bg-panel))] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="px-2 py-2">
             <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] truncate">{currentUser.firstName} {currentUser.lastName}</p>
             <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">{currentUser.email}</p>
          </div>
          <div className="h-px bg-[rgb(var(--color-border))] my-1"></div>
          <button
            onClick={() => {
              setAppView('generator');
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-2 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] hover:text-[rgb(var(--color-text-primary))] rounded-md transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            {t('profile_generator')}
          </button>
          <button
            onClick={() => {
              setAppView('profile', currentUser.email);
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-2 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] hover:text-[rgb(var(--color-text-primary))] rounded-md transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            {t('profile_my_profile')}
          </button>
           <button
            onClick={() => {
              setAppView('favorites');
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-2 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] hover:text-[rgb(var(--color-text-primary))] rounded-md transition-colors"
          >
            <HeartIcon className="w-4 h-4" />
            {t('profile_my_favorites')}
          </button>
          <button
            onClick={() => {
              setAppView('history');
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-2 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] hover:text-[rgb(var(--color-text-primary))] rounded-md transition-colors"
          >
            <ClockIcon className="w-4 h-4" />
            {t('profile_my_history')}
          </button>
          <button
            onClick={logout}
            className="w-full text-left mt-1 px-2 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors"
          >
            {t('profile_logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;