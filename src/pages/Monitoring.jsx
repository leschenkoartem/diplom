import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert, Container } from 'react-bootstrap';
import { FaTemperatureHigh, FaTint, FaVial } from 'react-icons/fa';
import SimulationToggle from '../components/SimulationToggle';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';

const Monitoring = () => {
  const [simulationEnabled] = useAnomalySimulation();
  const [orders, setOrders] = useState([]);

  // Завантажуємо реальні замовлення з localStorage
  useEffect(() => {
    const loadOrders = () => {
      const saved = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(saved);
    };

    loadOrders();
    // Оновлюємо кожні 2 секунди (якщо користувач створює нове замовлення)
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!simulationEnabled || orders.length === 0) return;

    const sensorInterval = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => {
          // Імітація реальних змін
          const newTemp = parseFloat((18 + Math.random() * 12).toFixed(1));
          const newHumidity = parseFloat((40 + Math.random() * 40).toFixed(0));
          const newVibration = parseFloat((0.2 + Math.random() * 1.8).toFixed(2));

          let sensorStatus = 'normal';
          if (newTemp > 28 || newTemp < 8 || newVibration > 1.5) sensorStatus = 'critical';
          else if (newTemp > 24 || newVibration > 0.8) sensorStatus = 'warning';

          return {
            ...order,
            temperature: newTemp,
            humidity: newHumidity,
            vibration: newVibration,
            sensorStatus,
            lastUpdate: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
          };
        })
      );
    }, 2500); // оновлення кожні 2.5 секунди

    return () => clearInterval(sensorInterval);
  }, [simulationEnabled, orders.length]);

  const getStatusBadge = (status) => {
    if (status === 'critical') return <Badge bg="danger">КРИТИЧНО</Badge>;
    if (status === 'warning') return <Badge bg="warning">УВАГА</Badge>;
    return <Badge bg="success">НОРМА</Badge>;
  };

  return (
    <Container>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="mb-0">Моніторинг стану вантажів</h2>
        <SimulationToggle />
      </div>

      {orders.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          Ще немає створених замовлень. Перейдіть на сторінку "Замовлення" та створіть перше.
        </Alert>
      ) : (
        <Row className="g-4">
          {orders.map((order) => (
            <Col md={6} lg={4} key={order.id}>
              <Card className="shadow-sm h-100 border-0">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <strong>#{order.order_id || order.id}</strong>
                  {getStatusBadge(order.sensorStatus)}
                </Card.Header>
                <Card.Body>
                  <p className="mb-1">
                    <strong>Маршрут:</strong> {order.start_point} → {order.end_point}
                  </p>
                  <p className="mb-3">
                    <strong>Вантаж:</strong> {order.cargo_type} — {order.weight} кг
                  </p>

                  <Row className="text-center g-3">
                    <Col>
                      <FaTemperatureHigh size={28} className="text-danger mb-1" />
                      <h4 className="mb-0">{order.temperature || 22.4}°C</h4>
                      <small className="text-muted">Температура</small>
                    </Col>
                    <Col>
                      <FaTint size={28} className="text-primary mb-1" />
                      <h4 className="mb-0">{order.humidity || 52}%</h4>
                      <small className="text-muted">Вологість</small>
                    </Col>
                    <Col>
                      <FaVial size={28} className="text-warning mb-1" />
                      <h4 className="mb-0">{order.vibration || 0.8}</h4>
                      <small className="text-muted">Вібрація (g)</small>
                    </Col>
                  </Row>

                  <div className="mt-3 d-flex justify-content-between small text-muted">
                    <span>Оновлено: {order.lastUpdate || 'щойно'}</span>
                    <span className="text-success">🟢 Онлайн</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Monitoring;