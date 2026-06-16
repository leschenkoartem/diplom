import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Alert, Container } from 'react-bootstrap';
import { FaTemperatureHigh, FaTint, FaVial } from 'react-icons/fa';
import SimulationToggle from '../components/SimulationToggle';
import PageHero from '../components/PageHero';
import SensorMetric from '../components/SensorMetric';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';
import { useModernTheme } from '../hooks/useModernTheme';
import { monitoringApi } from '../api/client';

const toPercent = (value, min, max) => {
  if (value == null) return 50;
  return Math.max(8, Math.min(100, ((value - min) / (max - min)) * 100));
};

const Monitoring = () => {
  const [isModern] = useModernTheme();
  const [simulationEnabled] = useAnomalySimulation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    if (!simulationEnabled) {
      setOrders([]);
      return;
    }
    try {
      const response = await monitoringApi.list();
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Не вдалося завантажити дані моніторингу');
    }
  }, [simulationEnabled]);

  useEffect(() => {
    loadOrders();
    if (!simulationEnabled) return undefined;
    const interval = setInterval(loadOrders, 2500);
    return () => clearInterval(interval);
  }, [loadOrders, simulationEnabled]);

  const getStatusBadge = (status) => {
    if (status === 'critical') return <Badge bg="danger">КРИТИЧНО</Badge>;
    if (status === 'warning') return <Badge bg="warning">УВАГА</Badge>;
    return <Badge bg="success">НОРМА</Badge>;
  };

  const getModernStatus = (status) => {
    if (status === 'critical') return { label: 'Критично', cls: 'critical' };
    if (status === 'warning') return { label: 'Увага', cls: 'warning' };
    return { label: 'Норма', cls: 'normal' };
  };

  const emptySimulation = (
    <Alert variant="secondary" className={isModern ? 'm-empty m-empty--panel' : 'text-center py-4'}>
      Імітацію сенсорних даних вимкнено. Увімкніть перемикач для отримання показників з серверної IoT-підсистеми.
    </Alert>
  );

  const emptyOrders = (
    <Alert variant="info" className={isModern ? 'm-empty m-empty--panel' : 'text-center py-4'}>
      Ще немає створених замовлень. Перейдіть на сторінку «Замовлення» та створіть перше.
    </Alert>
  );

  if (isModern) {
    return (
      <div className="m-page">
        <Container fluid="lg">
          <div className="m-page__toolbar m-page__toolbar--stack">
            <PageHero
              eyebrow="IoT-моніторинг"
              title="Стан вантажів"
              subtitle="Температура, вологість та вібрація з серверної підсистеми датчиків"
            />
            <SimulationToggle />
          </div>

          {error && <Alert variant="danger" className="m-alert">{error}</Alert>}
          {!simulationEnabled ? emptySimulation : orders.length === 0 ? emptyOrders : (
            <div className="m-monitor-grid">
              {orders.map((order) => {
                const st = getModernStatus(order.sensor_status);
                const temp = order.temperature ?? 22.4;
                const humidity = order.humidity ?? 52;
                const vibration = order.vibration ?? 0.8;
                return (
                  <article key={order.id} className={`m-monitor-card m-monitor-card--${st.cls}`}>
                    <header className="m-monitor-card__head">
                      <div>
                        <span className="m-monitor-card__id">{order.order_id}</span>
                        <p className="m-monitor-card__route">{order.start_point} → {order.end_point}</p>
                      </div>
                      <span className={`m-status-pill m-status-pill--${st.cls}`}>{st.label}</span>
                    </header>
                    <p className="m-monitor-card__cargo">{order.cargo_type} · {order.weight} кг</p>
                    <div className="m-monitor-card__metrics">
                      <SensorMetric icon={FaTemperatureHigh} value={temp} unit="°C" label="Температура" tone="rose" percent={toPercent(temp, 8, 32)} />
                      <SensorMetric icon={FaTint} value={humidity} unit="%" label="Вологість" tone="sky" percent={toPercent(humidity, 35, 80)} />
                      <SensorMetric icon={FaVial} value={vibration} label="Вібрація (g)" tone="amber" percent={toPercent(vibration, 0, 3)} />
                    </div>
                    <footer className="m-monitor-card__foot">
                      <span>Оновлено: {order.last_update || 'щойно'}</span>
                      <span className="m-live"><i /> Онлайн</span>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </div>
    );
  }

  return (
    <Container>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="mb-0">Моніторинг стану вантажів</h2>
        <SimulationToggle />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {!simulationEnabled ? emptySimulation : orders.length === 0 ? emptyOrders : (
        <Row className="g-4">
          {orders.map((order) => (
            <Col md={6} lg={4} key={order.id}>
              <Card className="shadow-sm h-100 border-0">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <strong>{order.order_id}</strong>
                  {getStatusBadge(order.sensor_status)}
                </Card.Header>
                <Card.Body>
                  <p className="mb-1"><strong>Маршрут:</strong> {order.start_point} → {order.end_point}</p>
                  <p className="mb-3"><strong>Вантаж:</strong> {order.cargo_type} — {order.weight} кг</p>
                  <Row className="text-center g-3">
                    <Col>
                      <FaTemperatureHigh size={28} className="text-danger mb-1" />
                      <h4 className="mb-0">{order.temperature ?? 22.4}°C</h4>
                      <small className="text-muted">Температура</small>
                    </Col>
                    <Col>
                      <FaTint size={28} className="text-primary mb-1" />
                      <h4 className="mb-0">{order.humidity ?? 52}%</h4>
                      <small className="text-muted">Вологість</small>
                    </Col>
                    <Col>
                      <FaVial size={28} className="text-warning mb-1" />
                      <h4 className="mb-0">{order.vibration ?? 0.8}</h4>
                      <small className="text-muted">Вібрація (g)</small>
                    </Col>
                  </Row>
                  <div className="mt-3 d-flex justify-content-between small text-muted">
                    <span>Оновлено: {order.last_update || 'щойно'}</span>
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
