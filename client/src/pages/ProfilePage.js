import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Alert, Button } from 'react-bootstrap';
import api from '../services/api';
import LocationItem from '../components/locations/LocationItem';

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [userLocations, setUserLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Загружаем локации пользователя
      const fetchUserLocations = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/locations/user/${user.id}`);
          setUserLocations(response.data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Ошибка при загрузке локаций');
          setLoading(false);
        }
      };

      fetchUserLocations();
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated) {
    return null; // Перенаправление произойдет в useEffect
  }

  return (
    <Container>
      <h1 className="mb-4">Профиль пользователя</h1>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Информация о пользователе</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Имя пользователя:</strong> {user.username}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {user.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Button variant="outline-primary" size="sm">Редактировать профиль</Button>
            </Card.Footer>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Действия</Card.Title>
              <div className="d-grid gap-2">
                <Link to="/add-location">
                  <Button variant="primary" className="w-100">Добавить новую локацию</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Мои локации</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <Alert variant="info">Загрузка локаций...</Alert>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : userLocations.length === 0 ? (
                <Alert variant="warning">
                  У вас пока нет добавленных локаций.{' '}
                  <Link to="/add-location">Добавить локацию</Link>
                </Alert>
              ) : (
                <Row>
                  {userLocations.map(location => (
                    <Col key={location.id} md={6} className="mb-4">
                      <LocationItem location={location} />
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
