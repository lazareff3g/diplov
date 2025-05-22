import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart, FaMapMarkedAlt, FaList } from 'react-icons/fa';
import api from '../services/api';
import LocationList from '../components/locations/LocationList';
import LocationMap from '../components/map/LocationMap';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'map'
  
  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favorites' } });
    }
  }, [isAuthenticated, navigate]);
  
  // Загрузка избранных локаций
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.get('/favorites');
        setFavorites(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке избранных локаций:', err);
        setError('Не удалось загрузить избранные локации');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);
  
  // Обработчик удаления из избранного
  const handleRemoveFromFavorites = async (locationId) => {
    try {
      await api.delete(`/favorites/${locationId}`);
      setFavorites(favorites.filter(location => location.id !== locationId));
    } catch (err) {
      console.error('Ошибка при удалении из избранного:', err);
      alert('Не удалось удалить локацию из избранного');
    }
  };
  
  if (!isAuthenticated) {
    return null; // Редирект будет выполнен в useEffect
  }
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FaHeart className="text-danger me-2" />
          Избранные локации
        </h1>
        
        <div className="view-toggle">
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setViewMode('grid')}
          >
            <FaList className="me-1" /> Список
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('map')}
          >
            <FaMapMarkedAlt className="me-1" /> Карта
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {favorites.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h3>У вас пока нет избранных локаций</h3>
            <p className="text-muted">
              Добавляйте интересные места в избранное, чтобы быстро находить их позже
            </p>
            <Link to="/locations" className="btn btn-primary mt-3">
              Найти интересные места
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Row>
              {favorites.map(location => (
                <Col key={location.id} md={6} lg={4} className="mb-4">
                  <Card className="favorite-card h-100">
                    <Card.Body>
                      <Card.Title>{location.name}</Card.Title>
                      <div className="mb-2">
                        <span className="badge bg-secondary me-2">{location.category_name}</span>
                      </div>
                      <Card.Text className="location-description">
                        {location.description.length > 150 
                          ? `${location.description.substring(0, 150)}...` 
                          : location.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <Link to={`/locations/${location.id}`} className="btn btn-sm btn-primary">
                        Подробнее
                      </Link>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveFromFavorites(location.id)}
                      >
                        Удалить из избранного
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="map-container">
              <LocationMap locations={favorites} />
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default FavoritesPage;
