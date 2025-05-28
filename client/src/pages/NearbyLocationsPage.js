// client/src/pages/NearbyLocationsPage.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaLocationArrow } from 'react-icons/fa';
import api from '../services/api';
import MapComponent from '../components/map/MapComponent';

const NearbyLocationsPage = () => {
  const navigate = useNavigate();
  
  // ИСПРАВЛЕНО: Инициализируем locations как пустой массив
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Получение геолокации пользователя
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setGettingLocation(false);
        console.log('✅ Геолокация получена:', { latitude, longitude });
        
        // Автоматически ищем локации после получения координат
        searchNearbyLocations(latitude, longitude, searchRadius);
      },
      (error) => {
        console.error('❌ Ошибка геолокации:', error);
        setGettingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Доступ к геолокации запрещен. Разрешите доступ к местоположению.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Информация о местоположении недоступна.');
            break;
          case error.TIMEOUT:
            setError('Время ожидания определения местоположения истекло.');
            break;
          default:
            setError('Произошла неизвестная ошибка при определении местоположения.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 минут
      }
    );
  };

  // Поиск ближайших локаций
  const searchNearbyLocations = async (lat, lng, radius) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Поиск ближайших локаций:', { lat, lng, radius });
      
      const response = await api.get('/locations/nearby', {
        params: {
          latitude: lat,
          longitude: lng,
          radius: radius
        }
      });
      
      console.log('📍 Ответ от сервера:', response.data);
      
      if (response.data.success) {
        // ИСПРАВЛЕНО: Проверяем что locations является массивом
        const nearbyLocations = Array.isArray(response.data.locations) 
          ? response.data.locations 
          : [];
          
        setLocations(nearbyLocations);
        console.log('✅ Найдено ближайших локаций:', nearbyLocations.length);
      } else {
        throw new Error(response.data.message || 'Ошибка поиска локаций');
      }
      
    } catch (err) {
      console.error('❌ Ошибка поиска ближайших локаций:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при поиске ближайших локаций');
      // ИСПРАВЛЕНО: При ошибке устанавливаем пустой массив
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения радиуса поиска
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    
    if (userLocation) {
      searchNearbyLocations(userLocation.latitude, userLocation.longitude, newRadius);
    }
  };

  // Обработчик клика по локации на карте
  const handleLocationSelect = (locationData) => {
    // Находим локацию по координатам
    const foundLocation = locations.find(loc => 
      Math.abs(loc.latitude - locationData.coordinates[0]) < 0.001 &&
      Math.abs(loc.longitude - locationData.coordinates[1]) < 0.001
    );
    
    if (foundLocation) {
      navigate(`/locations/${foundLocation.id}`);
    }
  };

  return (
    <Container className="py-4">
      {/* ЗАГОЛОВОК */}
      <Row className="mb-4">
        <Col>
          <h1>
            <FaLocationArrow className="me-2 text-primary" />
            Ближайшие локации
          </h1>
          <p className="text-muted">
            Найдите интересные места для фотосъемки рядом с вами
          </p>
        </Col>
      </Row>

      {/* УПРАВЛЕНИЕ ПОИСКОМ */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🎯 Настройки поиска</h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Радиус поиска</Form.Label>
                <Form.Select 
                  value={searchRadius} 
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                >
                  <option value={1}>1 км</option>
                  <option value={5}>5 км</option>
                  <option value={10}>10 км</option>
                  <option value={25}>25 км</option>
                  <option value={50}>50 км</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Button 
                variant="primary" 
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-100"
              >
                {gettingLocation ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Определение местоположения...
                  </>
                ) : (
                  <>
                    <FaLocationArrow className="me-2" />
                    Найти мое местоположение
                  </>
                )}
              </Button>
            </Col>
            
            <Col md={4}>
              {userLocation && (
                <div className="text-success">
                  <small>
                    ✅ Местоположение определено
                    <br />
                    📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ОШИБКИ */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Ошибка</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* РЕЗУЛЬТАТЫ ПОИСКА */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Поиск ближайших локаций...</p>
        </div>
      ) : (
        <>
          {/* СТАТИСТИКА */}
          {userLocation && (
            <Row className="mb-4">
              <Col>
                <Alert variant="info">
                  <h6 className="mb-2">📊 Результаты поиска</h6>
                  <p className="mb-0">
                    Найдено <strong>{locations.length}</strong> локаций 
                    в радиусе <strong>{searchRadius} км</strong> от вашего местоположения
                  </p>
                </Alert>
              </Col>
            </Row>
          )}

          {/* КАРТА */}
          {userLocation && (
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">🗺️ Карта ближайших локаций</h5>
                  </Card.Header>
                  <Card.Body style={{ padding: 0 }}>
                    <MapComponent
                      center={[userLocation.latitude, userLocation.longitude]}
                      zoom={12}
                      height="500px"
                      locations={locations}
                      userLocation={userLocation}
                      onLocationSelect={handleLocationSelect}
                      interactive={true}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* СПИСОК ЛОКАЦИЙ */}
          <Row>
            <Col>
              <h4>📋 Список ближайших локаций</h4>
              
              {/* ИСПРАВЛЕНО: Проверяем что locations является массивом перед использованием map */}
              {Array.isArray(locations) && locations.length === 0 ? (
                <Alert variant="info">
                  <Alert.Heading>Локации не найдены</Alert.Heading>
                  <p>
                    {userLocation 
                      ? 'В указанном радиусе не найдено локаций для фотосъемки. Попробуйте увеличить радиус поиска.'
                      : 'Сначала определите ваше местоположение для поиска ближайших локаций.'
                    }
                  </p>
                </Alert>
              ) : (
                <Row>
                  {/* ИСПРАВЛЕНО: Безопасное использование map с проверкой */}
                  {Array.isArray(locations) && locations.map((location) => (
                    <Col md={6} lg={4} key={location.id} className="mb-4">
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title>{location.name}</Card.Title>
                          <Card.Text>
                            {location.description ? 
                              location.description.substring(0, 100) + '...' : 
                              'Описание не указано'
                            }
                          </Card.Text>
                          
                          <div className="mb-2">
                            <small className="text-muted">
                              <FaMapMarkerAlt className="me-1 text-danger" />
                              {location.address || 'Адрес не указан'}
                            </small>
                          </div>
                          
                          {location.distance_km && (
                            <div className="mb-2">
                              <small className="text-primary">
                                📏 Расстояние: {location.distance_km.toFixed(1)} км
                              </small>
                            </div>
                          )}
                          
                          <Button 
                            variant="primary" 
                            className="w-100"
                            onClick={() => navigate(`/locations/${location.id}`)}
                          >
                            Подробнее
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default NearbyLocationsPage;
