// src/pages/LocationDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { fetchLocationById } from '../redux/slices/locationSlice';
import api from '../services/api';
import PhotoGallery from '../components/Photos/PhotoGallery';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewList from '../components/Reviews/ReviewList';

const LocationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { location, loading, error } = useSelector(state => state.locations);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Загружаем данные локации при монтировании компонента
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        dispatch(fetchLocationById(id));
      } catch (err) {
        dispatch({ 
          type: 'locations/fetchLocationById/rejected', 
          error: { message: err.response?.data?.message || 'Ошибка при загрузке локации' }
        });
      }
    };
    
    fetchLocation();
  }, [dispatch, id]);
  
  // Проверяем, добавлена ли локация в избранное
  useEffect(() => {
    const checkIsFavorite = async () => {
      if (isAuthenticated && location) {
        try {
          const response = await api.get(`/favorites/check/${location.id}`);
          setIsFavorite(response.data.isFavorite);
        } catch (err) {
          console.error('Ошибка при проверке избранного:', err);
        }
      }
    };
    
    checkIsFavorite();
  }, [isAuthenticated, location]);
  
  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${location.id}`);
      } else {
        await api.post('/favorites', { location_id: location.id });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Ошибка при обновлении избранного:', err);
    }
  };
  
  // Обработчик удаления локации
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту локацию?')) {
      try {
        await api.delete(`/locations/${id}`);
        navigate('/locations');
      } catch (err) {
        console.error('Ошибка при удалении локации:', err);
      }
    }
  };
  
  // Если идет загрузка данных локации
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }
  
  // Если произошла ошибка при загрузке данных локации
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }
  
  // Если данные локации не найдены
  if (!location) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Локация не найдена
        </Alert>
      </Container>
    );
  }
  
  // Проверяем, является ли текущий пользователь владельцем локации
  const isOwner = isAuthenticated && user && location.created_by === user.id;
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>{location.name}</h1>
          <p className="text-muted">
            Добавил: {location.creator_username}
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {isAuthenticated ? (
            <Button 
              variant="outline-danger" 
              className="me-2"
              onClick={handleFavoriteToggle}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />} {isFavorite ? 'В избранном' : 'В избранное'}
            </Button>
          ) : (
            <Button variant="outline-secondary" disabled>
              <FaRegHeart /> Войдите, чтобы добавить в избранное
            </Button>
          )}
          
          {isOwner && (
            <>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate(`/locations/${id}/edit`)}
              >
                <FaEdit /> Редактировать
              </Button>
              <Button 
                variant="outline-danger"
                onClick={handleDelete}
              >
                <FaTrash /> Удалить
              </Button>
            </>
          )}
        </Col>
      </Row>
      
      {/* ИЗОБРАЖЕНИЕ НА ВСЮ ШИРИНУ */}
      <Row className="mb-4">
        <Col md={12}>
          <img 
            src={location.image_url || '/placeholder-image.jpg'} 
            alt={location.name}
            className="img-fluid rounded"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
        </Col>
      </Row>

      {/* КАРТА НА ВСЮ ШИРИНУ */}
      <Row className="mb-4">
        <Col md={12}>
          <div style={{ 
            width: '100%', 
            height: '600px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <YMaps>
              <Map
                defaultState={{ 
                  center: [location.latitude, location.longitude], 
                  zoom: 15 
                }}
                width="100%"
                height="100%"
                style={{ width: '100%', height: '100%' }}
                options={{
                  suppressMapOpenBlock: true,
                  autoFitToViewport: 'always'
                }}
              >
                <Placemark 
                  geometry={[location.latitude, location.longitude]}
                  properties={{
                    balloonContent: `
                      <div style="max-width: 350px;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">${location.name}</h4>
                        <p style="margin: 0 0 10px 0; color: #666;">${location.description ? location.description.substring(0, 150) + '...' : ''}</p>
                        <p style="margin: 0; color: #999;"><strong>Категория:</strong> ${location.category_name || ''}</p>
                      </div>
                    `,
                    hintContent: location.name
                  }}
                  options={{
                    preset: 'islands#violetIcon'
                  }}
                />
              </Map>
            </YMaps>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <div className="location-info">
            <p><FaMapMarkerAlt /> {location.city}, {location.address}</p>
            <p><strong>Категория:</strong> {location.category_name}</p>
            {location.best_time_of_day && (
              <p><strong>Лучшее время суток:</strong> {location.best_time_of_day}</p>
            )}
            {location.best_season && (
              <p><strong>Лучший сезон:</strong> {location.best_season}</p>
            )}
            {location.accessibility && (
              <p><strong>Доступность:</strong> {location.accessibility}</p>
            )}
            {location.difficulty_level && (
              <p><strong>Уровень сложности:</strong> {location.difficulty_level}</p>
            )}
            <p><strong>Требуется разрешение:</strong> {location.permission_required ? 'Да' : 'Нет'}</p>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Информация
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'photos' ? 'active' : ''}`}
                onClick={() => setActiveTab('photos')}
              >
                Фотографии
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Отзывы
              </button>
            </li>
          </ul>
          
          <div className="tab-content mt-3">
            {activeTab === 'info' && (
              <div className="tab-pane active">
                <h3>Описание</h3>
                <p>{location.description}</p>
              </div>
            )}
            
            {activeTab === 'photos' && (
              <div className="tab-pane active">
                <h3>Фотографии</h3>
                {isAuthenticated ? (
                  <PhotoGallery locationId={location.id} />
                ) : (
                  <Alert variant="info">
                    Войдите, чтобы добавлять и просматривать фотографии
                  </Alert>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="tab-pane active">
                <h3>Отзывы</h3>
                {isAuthenticated ? (
                  <>
                    <ReviewForm locationId={location.id} />
                    <ReviewList locationId={location.id} />
                  </>
                ) : (
                  <Alert variant="info">
                    Войдите, чтобы добавлять и просматривать отзывы
                  </Alert>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LocationDetailPage;
