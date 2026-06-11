import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
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