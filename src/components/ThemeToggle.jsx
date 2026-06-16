import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useModernTheme } from '../hooks/useModernTheme';

const ThemeToggle = () => {
  const [enabled, toggle] = useModernTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${enabled ? 'is-modern' : ''}`}
      onClick={toggle}
      aria-label={enabled ? 'Класичне оформлення' : 'Сучасне оформлення'}
      title={enabled ? 'Класичне оформлення' : 'Сучасне оформлення'}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__icons">
          <FaSun className="theme-toggle__icon theme-toggle__icon--sun" />
          <FaMoon className="theme-toggle__icon theme-toggle__icon--moon" />
        </span>
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-toggle__label d-none d-md-inline">
        {enabled ? 'Сучасний' : 'Класичний'}
      </span>
    </button>
  );
};

export default ThemeToggle;
