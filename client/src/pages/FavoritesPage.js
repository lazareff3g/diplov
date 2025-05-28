// client/src/pages/FavoritesPage.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart, FaMapMarkedAlt, FaList, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import api from '../services/api';
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
        setError(null);
        
        console.log('💖 Загрузка избранных локаций...');
        
        const response = await api.get('/favorites');
        
        console.log('📍 Ответ от сервера:', response.data);
        
        // ИСПРАВЛЕНО: Правильная обработка структуры ответа
        if (response.data.success) {
          setFavorites(response.data.favorites || []);
          console.log('✅ Избранные локации загружены:', response.data.favorites?.length || 0);
        } else {
          throw new Error(response.data.message || 'Ошибка загрузки избранного');
        }
        
      } catch (err) {
        console.error('❌ Ошибка при загрузке избранных локаций:', err);
        setError(err.response?.data?.message || err.message || 'Не удалось загрузить избранные локации');
        setFavorites([]); // ИСПРАВЛЕНО: Устанавливаем пустой массив при ошибке
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
    if (!window.confirm('Удалить локацию из избранного?')) {
      return;
    }
    
    try {
      console.log('🗑️ Удаление из избранного:', locationId);
      
      const response = await api.delete(`/favorites/${locationId}`);
      
      if (response.data.success) {
        // ИСПРАВЛЕНО: Правильное удаление из локального состояния
        setFavorites(prev => prev.filter(fav => fav.id !== locationId));
        console.log('✅ Локация удалена из избранного');
      } else {
        throw new Error(response.data.message || 'Ошибка удаления');
      }
      
    } catch (err) {
      console.error('❌ Ошибка при удалении из избранного:', err);
      alert(err.response?.data?.message || 'Не удалось удалить локацию из избранного');
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
        <p className="mt-3">Загрузка избранных локаций...</p>
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
        
        {/* ПОКАЗЫВАЕМ ПЕРЕКЛЮЧАТЕЛЬ ТОЛЬКО ЕСЛИ ЕСТЬ ЛОКАЦИИ */}
        {favorites.length > 0 && (
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
        )}
      </div>
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Ошибка</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {/* ИСПРАВЛЕНО: Проверяем что favorites является массивом */}
      {!Array.isArray(favorites) || favorites.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaHeart className="text-muted mb-3" size={48} />
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
          {/* СТАТИСТИКА */}
          <div className="mb-3">
            <small className="text-muted">
              Найдено избранных локаций: <strong>{favorites.length}</strong>
            </small>
          </div>
          
          {viewMode === 'grid' ? (
            <Row>
              {favorites.map(location => (
                <Col key={location.id} md={6} lg={4} className="mb-4">
                  <Card className="favorite-card h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{location.name}</Card.Title>
                      
                      {/* КАТЕГОРИЯ */}
                      {location.category_name && (
                        <div className="mb-2">
                          <span className="badge bg-secondary me-2">
                            {location.category_icon} {location.category_name}
                          </span>
                        </div>
                      )}
                      
                      {/* ОПИСАНИЕ */}
                      <Card.Text className="location-description">
                        {location.description && location.description.length > 150 
                          ? `${location.description.substring(0, 150)}...` 
                          : location.description || 'Описание не указано'}
                      </Card.Text>
                      
                      {/* АДРЕС */}
                      <div className="mb-2">
                        <small className="text-muted">
                          <FaMapMarkerAlt className="me-1 text-danger" />
                          {location.address || 'Адрес не указан'}
                        </small>
                      </div>
                      
                      {/* ДАТА ДОБАВЛЕНИЯ В ИЗБРАННОЕ */}
                      <div className="mb-2">
                        <small className="text-muted">
                          💖 Добавлено: {new Date(location.favorited_at).toLocaleDateString('ru-RU')}
                        </small>
                      </div>
                    </Card.Body>
                    
                    <Card.Footer className="d-flex justify-content-between">
                      <Link to={`/locations/${location.id}`} className="btn btn-sm btn-primary">
                        Подробнее
                      </Link>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveFromFavorites(location.id)}
                        title="Удалить из избранного"
                      >
                        <FaTrash />
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="map-container">
              {/* ЗДЕСЬ БУДЕТ КАРТА - ПОКА ЗАГЛУШКА */}
              <Alert variant="info">
                <h5>Карта избранных локаций</h5>
                <p>Функционал карты будет добавлен позже</p>
              </Alert>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default FavoritesPage;
