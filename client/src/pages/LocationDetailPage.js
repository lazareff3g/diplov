import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { getLocationStart, getLocationSuccess, getLocationFailure } from '../redux/slices/locationSlice';
import locationService from '../services/locationService';

const LocationDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { location, loading, error } = useSelector(state => state.locations);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        dispatch(getLocationStart());
        const data = await locationService.getLocationById(id);
        dispatch(getLocationSuccess(data));
      } catch (err) {
        dispatch(getLocationFailure(err.response?.data?.message || 'Ошибка при загрузке локации'));
      }
    };

    fetchLocation();
  }, [id, dispatch]);

  // Функция для преобразования значений в читаемый вид
  const formatValue = (key, value) => {
    const formats = {
      best_time_of_day: {
        morning: 'Утро',
        afternoon: 'День',
        evening: 'Вечер',
        night: 'Ночь'
      },
      best_season: {
        spring: 'Весна',
        summer: 'Лето',
        autumn: 'Осень',
        winter: 'Зима',
        any: 'Любой сезон'
      },
      accessibility: {
        public_transport: 'Общественный транспорт',
        car: 'Автомобиль',
        walking: 'Пешком',
        mixed: 'Смешанный'
      },
      difficulty_level: {
        easy: 'Легкий',
        medium: 'Средний',
        hard: 'Сложный'
      }
    };

    return formats[key] ? formats[key][value] || value : value;
  };

  if (loading) {
    return (
      <Container>
        <Alert variant="info">Загрузка информации о локации...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!location) {
    return (
      <Container>
        <Alert variant="warning">Локация не найдена</Alert>
      </Container>
    );
  }

  const isOwner = isAuthenticated && user && location.created_by === user.id;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>{location.name}</h1>
          <div className="mb-3">
            <Badge bg="secondary" className="me-2">{location.category_name}</Badge>
            {location.best_time_of_day && (
              <Badge bg="info" className="me-2">{formatValue('best_time_of_day', location.best_time_of_day)}</Badge>
            )}
            {location.best_season && (
              <Badge bg="success" className="me-2">{formatValue('best_season', location.best_season)}</Badge>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Описание</Card.Title>
              <Card.Text>{location.description}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Информация</Card.Title>
              <Row>
                <Col md={6}>
                  <p><strong>Адрес:</strong> {location.address}</p>
                  {location.accessibility && (
                    <p><strong>Доступность:</strong> {formatValue('accessibility', location.accessibility)}</p>
                  )}
                  {location.difficulty_level && (
                    <p><strong>Сложность:</strong> {formatValue('difficulty_level', location.difficulty_level)}</p>
                  )}
                </Col>
                <Col md={6}>
                  {location.best_time_of_day && (
                    <p><strong>Лучшее время:</strong> {formatValue('best_time_of_day', location.best_time_of_day)}</p>
                  )}
                  {location.best_season && (
                    <p><strong>Лучший сезон:</strong> {formatValue('best_season', location.best_season)}</p>
                  )}
                  <p>
                    <strong>Требуется разрешение:</strong> {location.permission_required ? 'Да' : 'Нет'}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Местоположение</Card.Title>
              <YMaps query={{ apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY }}>
                <Map
                  state={{
                    center: [location.latitude || 55.751244, location.longitude || 37.618423],
                    zoom: 15
                  }}
                  width="100%"
                  height="300px"
                >
                  <Placemark
                    geometry={[location.latitude || 55.751244, location.longitude || 37.618423]}
                    options={{ preset: 'islands#violetIcon' }}
                  />
                </Map>
              </YMaps>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Автор</Card.Title>
              <Card.Text>{location.creator_username}</Card.Text>
              <Card.Text className="text-muted">
                Добавлено: {new Date(location.created_at).toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>

          {isOwner && (
            <div className="d-grid gap-2">
              <Link to={`/locations/${location.id}/edit`}>
                <Button variant="warning" className="w-100 mb-2">Редактировать</Button>
              </Link>
              <Button variant="danger" className="w-100">Удалить</Button>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <Link to="/locations">
            <Button variant="secondary">&larr; Назад к списку локаций</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default LocationDetailPage;
