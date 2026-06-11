import React, { useState } from 'react';
import { Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';

const Auth = ({ onLogin }) => {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Реєстрація
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Логін
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === regData.email)) {
      setError("Користувач з таким email вже існує");
      return;
    }

    users.push({
      id: Date.now(),
      fullName: regData.fullName,
      email: regData.email,
      password: regData.password
    });

    localStorage.setItem('users', JSON.stringify(users));
    setSuccess("Реєстрація успішна! Тепер увійдіть.");
    setTab('login');
    setRegData({ fullName: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);

    if (user) {
      localStorage.setItem('token', 'jwt-' + user.id);
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin();
    } else {
      setError("Невірний email або пароль");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '420px' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Авторизація</h3>

          <Tabs activeKey={tab} onSelect={setTab} className="mb-4">
            <Tab eventKey="login" title="Вхід">
              <Form onSubmit={handleLogin}>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control 
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Увійти
                </Button>
              </Form>
            </Tab>

            <Tab eventKey="register" title="Реєстрація">
              <Form onSubmit={handleRegister}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Label>ПІБ</Form.Label>
                  <Form.Control 
                    value={regData.fullName}
                    onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({...regData, email: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control 
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({...regData, password: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Підтвердіть пароль</Form.Label>
                  <Form.Control 
                    type="password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                    required 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Зареєструватися
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Auth;