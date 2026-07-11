'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const saved = localStorage.getItem('studyvault_theme') as 'light' | 'dark' | 'system';
    if (saved) {
      setTimeout(() => {
        setThemeState(saved);
      }, 0);
    }
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('studyvault_theme', newTheme);
    
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.remove('dark');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  };

  return (
    <div className="flex gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
      <button
        onClick={() => changeTheme('light')}
        className={`flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-card text-indigo-500 dark:text-indigo-400 font-bold shadow-xs border border-border/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => changeTheme('dark')}
        className={`flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-card text-indigo-500 dark:text-indigo-400 font-bold shadow-xs border border-border/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => changeTheme('system')}
        className={`flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-card text-indigo-500 dark:text-indigo-400 font-bold shadow-xs border border-border/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="System settings"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
