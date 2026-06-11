import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaChartLine, FaBell } from 'react-icons/fa';
import SimulationToggle from '../components/SimulationToggle';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';

const Dashboard = () => {
  const [simulationEnabled] = useAnomalySimulation();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    onRoute: 0,
    anomalies: 0
  });

  useEffect(() => {
    const loadStats = () => {
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const active = orders.length;

      setStats(prev => ({
        totalOrders: orders.length,
        activeOrders: active,
        onRoute: Math.floor(active * 0.7),
        anomalies: simulationEnabled ? Math.floor(Math.random() * 3) : 0
      }));
    };

    loadStats();
    if (!simulationEnabled) return;

    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, [simulationEnabled]);

  return (
    <Container>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Дашборд системи</h1>
        <p className="lead text-muted">Реальний стан мультимодальних перевезень</p>
      </div>

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
              <Badge bg={stats.anomalies > 0 ? "warning" : "success"}>
                {stats.anomalies > 0 ? "Потрібна увага" : "Норма"}
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