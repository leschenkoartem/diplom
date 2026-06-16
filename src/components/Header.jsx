import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTruck, FaSignOutAlt } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { useModernTheme } from '../hooks/useModernTheme';

const Header = ({ isAuthenticated, onLogout }) => {
  const [isModern] = useModernTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Головна' },
    { to: '/orders', label: 'Замовлення' },
    { to: '/monitoring', label: 'Моніторинг' },
  ];

  if (isModern) {
    return (
      <header className="m-header">
        <Container fluid="lg" className="m-header__inner">
          <Link to="/" className="m-header__brand">
            <span className="m-header__logo"><FaTruck /></span>
            <span>
              <strong>Multimodal</strong>
              <small>ICS Platform</small>
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="m-header__nav">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={location.pathname === item.to ? 'active' : ''}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="m-header__actions">
            <ThemeToggle />
            {isAuthenticated ? (
              <button type="button" className="m-btn m-btn--ghost m-btn--sm" onClick={onLogout}>
                <FaSignOutAlt /> Вихід
              </button>
            ) : (
              <button type="button" className="m-btn m-btn--primary m-btn--sm" onClick={() => navigate('/')}>
                Увійти
              </button>
            )}
          </div>
        </Container>
      </header>
    );
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-4">
          <FaTruck className="me-2 text-primary" size={32} />
          Multimodal
        </Navbar.Brand>
        {isAuthenticated && <Navbar.Toggle aria-controls="navbar-nav" />}
        <Navbar.Collapse id="navbar-nav">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Головна</Nav.Link>
              <Nav.Link as={Link} to="/orders">Замовлення</Nav.Link>
              <Nav.Link as={Link} to="/monitoring">Моніторинг</Nav.Link>
            </Nav>
          )}
          <Nav className="ms-auto align-items-center gap-2 gap-md-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="outline-light" onClick={onLogout} className="d-flex align-items-center gap-2">
                <FaSignOutAlt /> Вихід
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/')}>Увійти</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
