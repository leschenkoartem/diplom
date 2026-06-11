import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Мультимодальні перевезення
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Дашборд</Nav.Link>
            <Nav.Link as={Link} to="/orders">Замовлення</Nav.Link>
            <Nav.Link as={Link} to="/monitoring">Моніторинг</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#">Вихід</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;