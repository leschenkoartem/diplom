import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Button, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaChartLine, FaBell, FaRoute } from 'react-icons/fa';
import SimulationToggle from '../components/SimulationToggle';
import PageHero from '../components/PageHero';
import StatCard from '../components/StatCard';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';
import { useModernTheme } from '../hooks/useModernTheme';
import { monitoringApi } from '../api/client';

const Dashboard = () => {
  const [isModern] = useModernTheme();
  const [simulationEnabled] = useAnomalySimulation();
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    onRoute: 0,
    anomalies: 0
  });

  const loadStats = useCallback(async () => {
    try {
      const response = await monitoringApi.dashboard();
      const data = response.data;
      setStats({
        totalOrders: data.total_orders,
        activeOrders: data.active_orders,
        onRoute: data.on_route,
        anomalies: simulationEnabled ? data.anomalies : 0,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Не вдалося завантажити статистику');
    }
  }, [simulationEnabled]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (isModern) {
    return (
      <div className="m-page">
        <Container fluid="lg">
          <PageHero
            eyebrow="Панель керування"
            title="Дашборд системи"
            subtitle="Огляд замовлень, маршрутів та сенсорного моніторингу вантажів у реальному часі"
          />

          {error && <Alert variant="danger" className="m-alert">{error}</Alert>}

          <div className="m-stat-grid">
            <StatCard icon={FaTruck} value={stats.totalOrders} label="Всього замовлень" tag="За весь час" tone="indigo" />
            <StatCard icon={FaChartLine} value={stats.activeOrders} label="Активних замовлень" tag="В роботі" tone="emerald" />
            <StatCard icon={FaRoute} value={stats.onRoute} label="На маршруті" tag="В дорозі" tone="cyan" />
            <StatCard icon={FaBell} value={stats.anomalies} label="Аномалій" tag={stats.anomalies > 0 ? 'Потрібна увага' : 'Норма'} tone="amber" />
          </div>

          <section className="m-panel m-panel--actions">
            <div className="m-panel__content">
              <div>
                <h3 className="m-panel__title">Швидкі дії</h3>
                <p className="m-panel__text">Керуйте перевезеннями та відстежуйте IoT-показники з одного місця</p>
              </div>
              <div className="m-panel__buttons">
                <SimulationToggle />
                <Link to="/orders" className="m-btn m-btn--primary">Створити замовлення</Link>
                <Link to="/monitoring" className="m-btn m-btn--ghost">Моніторинг</Link>
              </div>
            </div>
          </section>
        </Container>
      </div>
    );
  }

  return (
    <Container>
      <PageHero
        title="Дашборд системи"
        subtitle="Реальний стан мультимодальних перевезень"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col md={3}>
          <Card className="h-100 text-center shadow-sm hover-scale">
            <Card.Body>
              <FaTruck size={40} className="text-primary mb-3" />
              <h2 className="fw-bold">{stats.totalOrders}</h2>
              <p className="text-muted mb-1">Всього замовлень</p>
              <Badge bg="primary">За весь час</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center shadow-sm hover-scale">
            <Card.Body>
              <FaChartLine size={40} className="text-success mb-3" />
              <h2 className="fw-bold text-success">{stats.activeOrders}</h2>
              <p className="text-muted mb-1">Активних замовлень</p>
              <Badge bg="success">В роботі</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center shadow-sm hover-scale">
            <Card.Body>
              <FaTruck size={40} className="text-info mb-3" />
              <h2 className="fw-bold text-info">{stats.onRoute}</h2>
              <p className="text-muted mb-1">На маршруті</p>
              <Badge bg="info">В дорозі</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 text-center shadow-sm hover-scale">
            <Card.Body>
              <FaBell size={40} className="text-warning mb-3" />
              <h2 className="fw-bold text-warning">{stats.anomalies}</h2>
              <p className="text-muted mb-1">Аномалій</p>
              <Badge bg={stats.anomalies > 0 ? 'warning' : 'success'}>
                {stats.anomalies > 0 ? 'Потрібна увага' : 'Норма'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center mt-4">
        <SimulationToggle className="mx-auto" />
      </div>

      <div className="text-center mt-4">
        <Link to="/orders">
          <Button variant="primary" size="lg" className="me-3 px-4 py-3">
            Створити нове замовлення
          </Button>
        </Link>
        <Link to="/monitoring">
          <Button variant="success" size="lg" className="px-4 py-3">
            Перейти до моніторингу
          </Button>
        </Link>
      </div>
    </Container>
  );
};

export default Dashboard;
