import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';

const LocationItem = ({ location }) => {
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

  return (
    <Card className="mb-4 h-100">
      <Card.Body>
        <Card.Title>{location.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{location.category_name}</Card.Subtitle>
        <Card.Text>{location.description && location.description.substring(0, 150)}...</Card.Text>
        
        <div className="mb-3">
          {location.best_time_of_day && (
            <Badge bg="info" className="me-1">{formatValue('best_time_of_day', location.best_time_of_day)}</Badge>
          )}
          {location.best_season && (
            <Badge bg="success" className="me-1">{formatValue('best_season', location.best_season)}</Badge>
          )}
          {location.accessibility && (
            <Badge bg="warning" className="me-1">{formatValue('accessibility', location.accessibility)}</Badge>
          )}
          {location.difficulty_level && (
            <Badge bg="danger" className="me-1">{formatValue('difficulty_level', location.difficulty_level)}</Badge>
          )}
          {location.permission_required && (
            <Badge bg="dark">Требуется разрешение</Badge>
          )}
        </div>
        
        <Card.Text className="text-muted small">
          <strong>Адрес:</strong> {location.address}
        </Card.Text>
        
        <Link to={`/locations/${location.id}`}>
          <Button variant="primary">Подробнее</Button>
        </Link>
      </Card.Body>
      <Card.Footer className="text-muted">
        Добавил: {location.creator_username}
      </Card.Footer>
    </Card>
  );
};

export default LocationItem;
