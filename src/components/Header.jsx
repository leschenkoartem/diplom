import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTruck, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  return (
    <Navbar 
      bg="dark" 
      variant="dark" 
      expand="lg" 
      sticky="top"
      className="shadow-sm py-3"
    >
      <Container>
        {/* Логотип */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-4">
          <FaTruck className="me-2 text-primary" size={32} />
          Multimodal
        </Navbar.Brand>

        {/* Меню */}
        {isAuthenticated && (
          <Navbar.Toggle aria-controls="navbar-nav" />
        )}

        <Navbar.Collapse id="navbar-nav">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Головна</Nav.Link>
              <Nav.Link as={Link} to="/orders">Замовлення</Nav.Link>
              <Nav.Link as={Link} to="/monitoring">Моніторинг</Nav.Link>
            </Nav>
          )}

          {/* Кнопка виходу */}
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <Button 
                variant="outline-light" 
                onClick={onLogout}
                className="d-flex align-items-center gap-2"
              >
                <FaSignOutAlt /> Вихід
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/')}>
                Увійти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;