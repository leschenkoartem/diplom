import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Form, Row, Col } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const ORDER_STATUSES = [
  { value: 'new', label: 'Нове' },
  { value: 'in_transit', label: 'В дорозі' },
  { value: 'delivered', label: 'Доставлено' },
  { value: 'cancelled', label: 'Скасовано' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    start_point: '',
    end_point: '',
    cargo_type: '',
    weight: '',
    transport_modes: 'Повний мультимодальний',
    notes: ''
  });

  // Завантаження з localStorage
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
  }, []);

  const saveOrders = (newOrders) => {
    localStorage.setItem('orders', JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newOrder = {
      id: Date.now(),
      order_id: `#${String(orders.length + 1).padStart(3, '0')}`,
      start_point: formData.start_point,
      end_point: formData.end_point,
      cargo_type: formData.cargo_type,
      weight: parseFloat(formData.weight),
      transport_modes: formData.transport_modes,
      status: 'new',
      order_date: new Date().toISOString(),
      notes: formData.notes
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);

    // Очищення форми
    setFormData({
      start_point: '',
      end_point: '',
      cargo_type: '',
      weight: '',
      transport_modes: 'Повний мультимодальний',
      notes: ''
    });
    setShowForm(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    saveOrders(updatedOrders);
  };

  const handleDelete = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!window.confirm(`Видалити замовлення ${order?.order_id || ''}?`)) return;
    saveOrders(orders.filter(order => order.id !== orderId));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Замовлення на перевезення</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          + Нове замовлення
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Створення нового замовлення</h5>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Точка відправлення</Form.Label>
                  <Form.Control 
                    required
                    value={formData.start_point}
                    onChange={(e) => setFormData({...formData, start_point: e.target.value})}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Точка призначення</Form.Label>
                  <Form.Control 
                    required
                    value={formData.end_point}
                    onChange={(e) => setFormData({...formData, end_point: e.target.value})}
                  />
                </Col>

                <Col md={4}>
                  <Form.Label>Тип вантажу</Form.Label>
                  <Form.Control 
                    required
                    value={formData.cargo_type}
                    onChange={(e) => setFormData({...formData, cargo_type: e.target.value})}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Вага (кг)</Form.Label>
                  <Form.Control 
                    type="number" 
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Види транспорту</Form.Label>
                  <Form.Select
                    value={formData.transport_modes}
                    onChange={(e) => setFormData({...formData, transport_modes: e.target.value})}
                  >
                    <option>Повний мультимодальний</option>
                    <option>Авто + Залізниця</option>
                    <option>Авто + Морський</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="mt-3">
                <Button variant="success" type="submit" className="me-2">
                  Створити замовлення
                </Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Скасувати
                </Button>
              </div>
            </Form>
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
              {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_id}</td>
                    <td>{order.start_point} → {order.end_point}</td>
                    <td>{order.cargo_type}</td>
                    <td>{order.weight} кг</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={order.status || 'new'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ minWidth: '140px' }}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>{new Date(order.order_date).toLocaleDateString('uk-UA')}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        title="Видалити замовлення"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Замовлень поки немає. Створіть перше!
                  </td>
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