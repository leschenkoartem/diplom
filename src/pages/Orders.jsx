import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import PageHero from '../components/PageHero';
import { ordersApi } from '../api/client';
import { useModernTheme } from '../hooks/useModernTheme';

const ORDER_STATUSES = [
  { value: 'new', label: 'Нове' },
  { value: 'in_transit', label: 'В дорозі' },
  { value: 'delivered', label: 'Доставлено' },
  { value: 'cancelled', label: 'Скасовано' },
];

const statusClass = (status) => {
  if (status === 'in_transit') return 'transit';
  if (status === 'delivered') return 'done';
  if (status === 'cancelled') return 'cancel';
  return 'new';
};

const Orders = () => {
  const [isModern] = useModernTheme();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    start_point: '',
    end_point: '',
    cargo_type: '',
    weight: '',
    transport_modes: 'Повний мультимодальний',
    notes: ''
  });

  const loadOrders = async () => {
    try {
      const response = await ordersApi.list();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не вдалося завантажити замовлення');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await ordersApi.create({
        start_point: formData.start_point,
        end_point: formData.end_point,
        cargo_type: formData.cargo_type,
        weight: parseFloat(formData.weight),
        transport_modes: formData.transport_modes,
        notes: formData.notes,
      });
      await loadOrders();
      setFormData({
        start_point: '',
        end_point: '',
        cargo_type: '',
        weight: '',
        transport_modes: 'Повний мультимодальний',
        notes: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка створення замовлення');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка оновлення статусу');
    }
  };

  const handleDelete = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!window.confirm(`Видалити замовлення ${order?.order_id || ''}?`)) return;
    try {
      await ordersApi.remove(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка видалення');
    }
  };

  const orderForm = (
    <Form onSubmit={handleSubmit} className={isModern ? 'm-form' : ''}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Label>Точка відправлення</Form.Label>
          <Form.Control required value={formData.start_point} onChange={(e) => setFormData({ ...formData, start_point: e.target.value })} />
        </Col>
        <Col md={6}>
          <Form.Label>Точка призначення</Form.Label>
          <Form.Control required value={formData.end_point} onChange={(e) => setFormData({ ...formData, end_point: e.target.value })} />
        </Col>
        <Col md={4}>
          <Form.Label>Тип вантажу</Form.Label>
          <Form.Control required value={formData.cargo_type} onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })} />
        </Col>
        <Col md={4}>
          <Form.Label>Вага (кг)</Form.Label>
          <Form.Control type="number" required value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
        </Col>
        <Col md={4}>
          <Form.Label>Види транспорту</Form.Label>
          <Form.Select value={formData.transport_modes} onChange={(e) => setFormData({ ...formData, transport_modes: e.target.value })}>
            <option>Повний мультимодальний</option>
            <option>Авто + Залізниця</option>
            <option>Авто + Морський</option>
          </Form.Select>
        </Col>
      </Row>
      <div className="mt-3 d-flex gap-2 flex-wrap">
        <Button variant="success" type="submit" className={isModern ? 'm-btn m-btn--success' : ''} disabled={loading}>
          Створити замовлення
        </Button>
        <Button variant="secondary" className={isModern ? 'm-btn m-btn--ghost' : ''} onClick={() => setShowForm(false)}>
          Скасувати
        </Button>
      </div>
    </Form>
  );

  if (isModern) {
    return (
      <div className="m-page">
        <div className="m-page__toolbar">
          <PageHero eyebrow="Операції" title="Замовлення на перевезення" subtitle="Створюйте та керуйте мультимодальними рейсами" />
          <button type="button" className="m-btn m-btn--primary" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> {showForm ? 'Закрити форму' : 'Нове замовлення'}
          </button>
        </div>

        {error && <Alert variant="danger" className="m-alert">{error}</Alert>}

        {showForm && (
          <section className="m-panel m-panel--form">
            <h4 className="m-panel__title">Створення замовлення</h4>
            {orderForm}
          </section>
        )}

        <section className="m-orders-list">
          {orders.length === 0 ? (
            <div className="m-empty">Замовлень поки немає. Створіть перше!</div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="m-order-row">
                <div className="m-order-row__id">{order.order_id}</div>
                <div className="m-order-row__route">
                  <FaMapMarkerAlt className="text-cyan" />
                  <span>{order.start_point}</span>
                  <span className="m-order-row__arrow">→</span>
                  <span>{order.end_point}</span>
                </div>
                <div className="m-order-row__cargo">
                  <strong>{order.cargo_type}</strong>
                  <span>{order.weight} кг</span>
                </div>
                <div className={`m-order-row__status m-order-row__status--${statusClass(order.status)}`}>
                  <Form.Select
                    size="sm"
                    value={order.status || 'new'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="m-select-inline"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Form.Select>
                </div>
                <div className="m-order-row__date">
                  {new Date(order.order_date).toLocaleDateString('uk-UA')}
                </div>
                <button type="button" className="m-order-row__delete" onClick={() => handleDelete(order.id)} title="Видалити">
                  <FaTrash />
                </button>
              </article>
            ))
          )}
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Замовлення на перевезення</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Нове замовлення</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {showForm && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Створення нового замовлення</h5>
            {orderForm}
          </Card.Body>
        </Card>
      )}
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Маршрут</th>
                <th>Вантаж</th>
                <th>Вага</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_id}</td>
                  <td>{order.start_point} → {order.end_point}</td>
                  <td>{order.cargo_type}</td>
                  <td>{order.weight} кг</td>
                  <td>
                    <Form.Select size="sm" value={order.status || 'new'} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={{ minWidth: '140px' }}>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString('uk-UA')}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(order.id)} title="Видалити замовлення">
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Замовлень поки немає. Створіть перше!</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Orders;
