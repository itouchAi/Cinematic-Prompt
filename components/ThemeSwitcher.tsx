import React, { useState, useEffect, useRef } from 'react';
import { PaintBrushIcon } from './ui';

const themes = [
  { name: 'indigo', color: '#6366f1' },
  { name: 'rose', color: '#f43f5e' },
  { name: 'teal', color: '#10b981' },
  { name: 'amber', color: '#f59e0b' },
  { name: 'violet', color: '#8b5cf6' },
];

export const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        className="p-2 rounded-full bg-[rgba(var(--color-bg-secondary),0.5)] text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-bg-secondary),0.7)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))]]"
      >
        <PaintBrushIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-2 w-auto bg-[rgb(var(--color-bg-panel))] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="flex gap-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                aria-label={`Switch to ${theme.name} theme`}
                onClick={() => handleThemeChange(theme.name)}
                className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-panel))] focus:ring-[rgb(var(--color-primary-500))]]"
                style={{ backgroundColor: theme.color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};