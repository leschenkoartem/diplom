import React from 'react';
import { useModernTheme } from '../hooks/useModernTheme';

const PageHero = ({ eyebrow, title, subtitle, actions }) => {
  const [isModern] = useModernTheme();

  if (!isModern) {
    return (
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">{title}</h1>
        {subtitle && <p className="lead text-muted">{subtitle}</p>}
        {actions}
      </div>
    );
  }

  return (
    <header className="m-hero">
      {eyebrow && <span className="m-hero__eyebrow">{eyebrow}</span>}
      <h1 className="m-hero__title">{title}</h1>
      {subtitle && <p className="m-hero__subtitle">{subtitle}</p>}
      {actions && <div className="m-hero__actions">{actions}</div>}
    </header>
  );
};

export default PageHero;
