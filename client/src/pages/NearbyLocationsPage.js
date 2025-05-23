// client/src/pages/NearbyLocationsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { YMaps, Map, Placemark, Clusterer } from '@pbe/react-yandex-maps';
import LocationList from '../components/locations/LocationList';
import api from '../services/api';

const NearbyLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10);

  // Безопасная функция для обработки distance
  const safeDistance = (distance) => {
    if (typeof distance === 'number') {
      return distance.toFixed(1);
    }
    if (typeof distance === 'string') {
      const num = parseFloat(distance);
      return isNaN(num) ? '0.0' : num;
    }
    return '0.0';
  };

  // Получение текущего местоположения пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchNearbyLocations(latitude, longitude, radius);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          setError('Не удалось определить ваше местоположение. Разрешите доступ к геолокации.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setError('Геолокация не поддерживается вашим браузером');
    }
  }, []);

  // Поиск ближайших локаций
  const fetchNearbyLocations = async (latitude, longitude, searchRadius) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/locations/nearby', {
        params: {
          latitude,
          longitude,
          radius: searchRadius
        }
      });
      
      setLocations(response.data);
    } catch (err) {
      console.error('Ошибка при поиске ближайших локаций:', err);
      setError('Не удалось найти ближайшие локации');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения радиуса поиска
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userLocation) {
      fetchNearbyLocations(userLocation.latitude, userLocation.longitude, newRadius);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">🗺️ Локации поблизости</h1>
      
      {/* Контролы радиуса поиска */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Радиус поиска: {radius} км</Form.Label>
            <Form.Range
              min={1}
              max={50}
              value={radius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            />
            <div className="d-flex justify-content-between">
              <small>1 км</small>
              <small>50 км</small>
            </div>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button 
            variant="outline-primary"
            onClick={() => userLocation && fetchNearbyLocations(userLocation.latitude, userLocation.longitude, radius)}
            disabled={!userLocation || loading}
          >
            🔄 Обновить поиск
          </Button>
        </Col>
      </Row>

      {/* Сообщения об ошибках */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Карта с локациями поблизости */}
      {userLocation && (
        <Row className="mb-4">
          <Col md={12}>
            <div style={{ 
              width: '100%', 
              height: '500px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              overflow: 'hidden' 
            }}>
              <YMaps>
                <Map
                  defaultState={{ 
                    center: [userLocation.latitude, userLocation.longitude], 
                    zoom: 12 
                  }}
                  style={{ width: '100%', height: '100%' }}
                  options={{
                    suppressMapOpenBlock: true,
                    autoFitToViewport: 'always'
                  }}
                >
                  {/* Кластеризация меток */}
                  <Clusterer
                    options={{
                      preset: 'islands#invertedVioletClusterIcons',
                      groupByCoordinates: false,
                    }}
                  >
                    {/* Метка текущего местоположения */}
                    <Placemark
                      geometry={[userLocation.latitude, userLocation.longitude]}
                      properties={{
                        balloonContent: 'Ваше местоположение',
                        hintContent: 'Вы здесь'
                      }}
                      options={{
                        preset: 'islands#geolocationIcon',
                        iconColor: '#0077ff'
                      }}
                    />
                    
                    {/* Метки найденных локаций с ИСПРАВЛЕННОЙ обработкой distance */}
                    {locations.map((location) => (
                      <Placemark
                        key={location.id}
                        geometry={[location.latitude, location.longitude]}
                        properties={{
                          balloonContent: `
                            <div style="max-width: 300px;">
                              <h4>${location.name}</h4>
                              <p>${location.description ? location.description.substring(0, 100) + '...' : ''}</p>
                              <p><strong>Расстояние:</strong> ${safeDistance(location.distance)} км</p>
                              <a href="/locations/${location.id}" target="_blank">Подробнее</a>
                            </div>
                          `,
                          hintContent: location.name
                        }}
                        options={{
                          preset: 'islands#violetIcon'
                        }}
                      />
                    ))}
                  </Clusterer>
                </Map>
              </YMaps>
            </div>
          </Col>
        </Row>
      )}

      {/* Список найденных локаций */}
      <Row>
        <Col md={12}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Поиск локаций...</span>
              </Spinner>
              <p className="mt-3 text-muted">Ищем локации поблизости...</p>
            </div>
          ) : locations.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>Локации не найдены</Alert.Heading>
              <p>В радиусе {radius} км от вашего местоположения не найдено интересных мест для фотографии.</p>
              <hr />
              <p className="mb-0">
                💡 <strong>Попробуйте:</strong> Увеличить радиус поиска или проверить настройки геолокации.
              </p>
            </Alert>
          ) : (
            <>
              <h3>Найдено локаций: {locations.length}</h3>
              <LocationList 
                locations={locations}
                loading={false}
                error={null}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NearbyLocationsPage;
