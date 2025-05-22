import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { YMaps, Map, Placemark, Circle, GeolocationControl } from '@pbe/react-yandex-maps';
import { FaLocationArrow, FaSearch, FaMapMarkedAlt, FaList } from 'react-icons/fa';
import api from '../services/api';
import LocationList from '../components/locations/LocationList';
import './NearbyLocationsPage.css';

const NearbyLocationsPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(10); // радиус поиска в км
  const [viewMode, setViewMode] = useState('map'); // 'map' или 'list'
  const [mapInstance, setMapInstance] = useState(null);

  // Получение текущего местоположения пользователя
  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // После получения местоположения загружаем ближайшие локации
          fetchNearbyLocations(latitude, longitude, radius);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          setError('Не удалось определить ваше местоположение. Пожалуйста, разрешите доступ к геолокации или выберите точку на карте.');
          setLoading(false);
        }
      );
    } else {
      setError('Ваш браузер не поддерживает геолокацию');
      setLoading(false);
    }
  };

  // Загрузка ближайших локаций
  const fetchNearbyLocations = async (latitude, longitude, searchRadius) => {
    try {
      setLoading(true);
      const response = await api.get('/nearby-locations', {
        params: { latitude, longitude, radius: searchRadius }
      });
      setLocations(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке ближайших локаций:', err);
      setError('Не удалось загрузить ближайшие локации');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик клика по карте
  const handleMapClick = (e) => {
    const coords = e.get('coords');
    setUserLocation(coords);
    fetchNearbyLocations(coords[0], coords[1], radius);
  };

  // Обработчик изменения радиуса поиска
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    
    if (userLocation) {
      fetchNearbyLocations(userLocation[0], userLocation[1], newRadius);
    }
  };

  // Обработчик выбора локации на карте
  const handleLocationSelect = (location) => {
    if (mapInstance) {
      mapInstance.setCenter([location.latitude, location.longitude], 15);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Локации поблизости</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center mb-3 mb-md-0">
                <Button 
                  variant="primary" 
                  onClick={getUserLocation}
                  disabled={loading}
                  className="me-3"
                >
                  <FaLocationArrow className="me-2" />
                  Определить моё местоположение
                </Button>
                
                <div className="radius-selector">
                  <Form.Label className="mb-0 me-2">Радиус:</Form.Label>
                  <Form.Select 
                    value={radius} 
                    onChange={handleRadiusChange}
                    style={{ width: '100px' }}
                  >
                    <option value="1">1 км</option>
                    <option value="5">5 км</option>
                    <option value="10">10 км</option>
                    <option value="25">25 км</option>
                    <option value="50">50 км</option>
                  </Form.Select>
                </div>
              </div>
            </Col>
            
            <Col md={6} className="text-md-end">
              <div className="view-toggle">
                <Button 
                  variant={viewMode === 'map' ? 'primary' : 'outline-primary'}
                  className="me-2"
                  onClick={() => setViewMode('map')}
                >
                  <FaMapMarkedAlt className="me-1" /> Карта
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  <FaList className="me-1" /> Список
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {error && (
        <Alert variant="danger" className="mb-4">{error}</Alert>
      )}
      
      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      )}
      
      {viewMode === 'map' ? (
        <Card>
          <Card.Body className="p-0">
            <YMaps query={{ apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY }}>
              <Map
                defaultState={{
                  center: userLocation || [55.751244, 37.618423], // Москва по умолчанию
                  zoom: 10,
                  controls: ['zoomControl']
                }}
                width="100%"
                height="600px"
                onClick={handleMapClick}
                instanceRef={setMapInstance}
              >
                <GeolocationControl options={{ float: 'left' }} />
                
                {userLocation && (
                  <>
                    <Placemark
                      geometry={userLocation}
                      options={{
                        preset: 'islands#blueCircleDotIcon',
                        iconCaption: 'Вы здесь'
                      }}
                    />
                    <Circle
                      geometry={[userLocation, radius * 1000]} // радиус в метрах
                      options={{
                        fillColor: 'rgba(0, 100, 255, 0.1)',
                        strokeColor: 'rgba(0, 100, 255, 0.5)',
                        strokeWidth: 2
                      }}
                    />
                  </>
                )}
                
                {locations.map(location => (
                  <Placemark
                    key={location.id}
                    geometry={[location.latitude, location.longitude]}
                    properties={{
                      balloonContentHeader: location.name,
                      balloonContentBody: location.description,
                      balloonContentFooter: `<a href="/locations/${location.id}" target="_blank">Подробнее</a>`,
                      hintContent: location.name
                    }}
                    options={{
                      preset: 'islands#violetIcon'
                    }}
                  />
                ))}
              </Map>
            </YMaps>
          </Card.Body>
        </Card>
      ) : (
        <>
          {locations.length === 0 ? (
            <Alert variant="info">
              {userLocation 
                ? 'В указанном радиусе не найдено локаций. Попробуйте увеличить радиус поиска.' 
                : 'Определите ваше местоположение для поиска ближайших локаций.'}
            </Alert>
          ) : (
            <LocationList 
              locations={locations} 
              onLocationSelect={handleLocationSelect}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default NearbyLocationsPage;
