import React, { useState } from 'react';
import { Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaTruck, FaShieldAlt, FaSatelliteDish } from 'react-icons/fa';
import { authApi } from '../api/client';
import { useModernTheme } from '../hooks/useModernTheme';

const Auth = ({ onLogin }) => {
  const [isModern] = useModernTheme();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const saveSession = (response) => {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    onLogin();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (regData.password !== regData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register({
        full_name: regData.fullName,
        email: regData.email,
        password: regData.password,
      });
      saveSession(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const response = await authApi.login({
        email: loginData.email,
        password: loginData.password,
      });
      saveSession(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Невірний email або пароль');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form onSubmit={handleLogin} className={isModern ? 'm-form' : ''}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit" className={isModern ? 'm-btn m-btn--primary w-100' : 'w-100'} disabled={loading}>
        Увійти
      </Button>
    </Form>
  );

  const registerForm = (
    <Form onSubmit={handleRegister} className={isModern ? 'm-form' : ''}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>ПІБ</Form.Label>
        <Form.Control
          value={regData.fullName}
          onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={regData.email}
          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          value={regData.password}
          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
          required
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>Підтвердіть пароль</Form.Label>
        <Form.Control
          type="password"
          value={regData.confirmPassword}
          onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
          required
        />
      </Form.Group>
      <Button variant="success" type="submit" className={isModern ? 'm-btn m-btn--success w-100' : 'w-100'} disabled={loading}>
        Зареєструватися
      </Button>
    </Form>
  );

  if (isModern) {
    return (
      <div className="m-auth">
        <aside className="m-auth__brand">
          <div className="m-auth__brand-inner">
            <div className="m-auth__logo">
              <FaTruck />
              <span>Multimodal ICS</span>
            </div>
            <h2 className="m-auth__headline">Керування мультимодальними перевезеннями</h2>
            <p className="m-auth__desc">
              Інтегрована платформа для замовлень, маршрутів та IoT-моніторингу стану вантажу
            </p>
            <ul className="m-auth__features">
              <li><FaShieldAlt /> JWT-авторизація та ролі користувачів</li>
              <li><FaSatelliteDish /> Сенсорний моніторинг кожні 2.4 с</li>
              <li><FaTruck /> Мультимодальні маршрути та аномалії</li>
            </ul>
          </div>
        </aside>
        <section className="m-auth__panel">
          <div className="m-auth__card">
            <h3 className="m-auth__title">Ласкаво просимо</h3>
            <p className="m-auth__subtitle">Увійдіть або створіть обліковий запис оператора</p>
            <div className="m-auth__tabs">
              <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Вхід</button>
              <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>Реєстрація</button>
            </div>
            {tab === 'login' ? loginForm : registerForm}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '420px' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Авторизація</h3>
          <Tabs activeKey={tab} onSelect={(k) => { setTab(k); setError(''); setSuccess(''); }} className="mb-4">
            <Tab eventKey="login" title="Вхід">{loginForm}</Tab>
            <Tab eventKey="register" title="Реєстрація">{registerForm}</Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Auth;
