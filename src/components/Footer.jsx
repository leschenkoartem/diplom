import React from 'react';
import { Container } from 'react-bootstrap';
import { useModernTheme } from '../hooks/useModernTheme';

const Footer = () => {
  const [isModern] = useModernTheme();

  if (isModern) {
    return (
      <footer className="m-footer">
        <Container fluid="lg" className="m-footer__inner">
          <span>Бакалаврська робота · ІС мультимодальних перевезень</span>
          <span>© 2026 · КПІ · ІСТ</span>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container className="text-center">
        <p className="mb-1">
          Бакалаврська робота • Інформаційно-управляюча система мультимодальних перевезень
        </p>
        <p className="mb-0 small text-muted">
          © 2026 • Спеціальність: Інформаційні системи та технології
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
