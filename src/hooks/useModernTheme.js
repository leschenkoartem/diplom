import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'modernThemeEnabled';
const EVENT_NAME = 'modern-theme-toggle';

const readEnabled = () => localStorage.getItem(STORAGE_KEY) === 'true';

const applyTheme = (enabled) => {
  document.documentElement.dataset.theme = enabled ? 'modern' : 'classic';
};

export const useModernTheme = () => {
  const [enabled, setEnabled] = useState(readEnabled);

  useEffect(() => {
    applyTheme(readEnabled());
    const handler = (e) => {
      setEnabled(e.detail);
      applyTheme(e.detail);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const toggle = useCallback(() => {
    const next = !readEnabled();
    localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
    setEnabled(next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  }, []);

  return [enabled, toggle];
};
