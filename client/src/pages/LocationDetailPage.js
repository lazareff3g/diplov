// client/src/pages/LocationDetailPage.js - ПОЛНАЯ ВЕРСИЯ СО ВСЕМ ФУНКЦИОНАЛОМ
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Alert, Spinner, Nav } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaMapMarkerAlt, FaStar, FaCamera, FaComment } from 'react-icons/fa';
import api from '../services/api';
import MapComponent from '../components/map/MapComponent';
import PhotoGallery from '../components/Photos/PhotoGallery';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewList from '../components/Reviews/ReviewList';

const LocationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // Локальное состояние для локации
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  
  // Загрузка локации
  useEffect(() => {
    const fetchLocation = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ ID локации не определен или невалидный:', id);
        navigate('/locations');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('📍 Загрузка локации с ID:', id);
        
        const response = await api.get(`/locations/${id}`);
        
        if (response.data.success) {
          setLocation(response.data.location);
          console.log('✅ Локация загружена:', response.data.location);
        } else {
          throw new Error(response.data.message || 'Локация не найдена');
        }
        
      } catch (err) {
        console.error('❌ Ошибка при загрузке локации:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка при загрузке локации');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocation();
  }, [id, navigate]);

  // Загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      if (!location?.id) return;
      
      try {
        console.log('📝 Загрузка отзывов для локации:', location.id);
        const response = await api.get(`/reviews/location/${location.id}`);
        
        if (response.data.success) {
          setReviews(response.data.reviews);
          setAverageRating(response.data.averageRating || 0);
          setReviewsCount(response.data.reviews.length);
          console.log('✅ Отзывы загружены:', response.data.reviews.length);
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки отзывов:', err);
      }
    };
    
    fetchReviews();
  }, [location?.id]);

  // Загрузка фотографий
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!location?.id) return;
      
      try {
        console.log('📸 Загрузка фотографий для локации:', location.id);
        const response = await api.get(`/photos/location/${location.id}`);
        
        if (response.data.success) {
          setPhotos(response.data.photos);
          console.log('✅ Фотографии загружены:', response.data.photos.length);
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки фотографий:', err);
      }
    };
    
    fetchPhotos();
  }, [location?.id]);
  
  // Проверка избранного
  useEffect(() => {
    const checkIsFavorite = async () => {
      if (!isAuthenticated || !location?.id) {
        console.log('⚠️ Пропускаем проверку избранного - нет авторизации или локации');
        setIsFavorite(false);
        return;
      }
      
      try {
        console.log('🔍 Проверяем избранное для локации:', location.id);
        
        const response = await api.get(`/favorites/check/${location.id}`);
        
        if (response.data.success) {
          setIsFavorite(response.data.isFavorite);
          console.log('✅ Статус избранного:', response.data.isFavorite);
        } else {
          setIsFavorite(false);
        }
        
      } catch (err) {
        console.error('❌ Ошибка при проверке избранного:', err);
        setIsFavorite(false);
      }
    };
    
    checkIsFavorite();
  }, [isAuthenticated, location?.id]);
  
  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Войдите в систему, чтобы добавить в избранное');
      return;
    }
    
    if (!location?.id) {
      console.error('❌ Нет ID локации для добавления в избранное');
      return;
    }
    
    try {
      console.log('🔄 Изменение статуса избранного для локации:', location.id);
      
      if (isFavorite) {
        const response = await api.delete(`/favorites/${location.id}`);
        if (response.data.success) {
          setIsFavorite(false);
          console.log('✅ Удалено из избранного');
        }
      } else {
        const response = await api.post('/favorites', { location_id: location.id });
        if (response.data.success) {
          setIsFavorite(true);
          console.log('✅ Добавлено в избранное');
        }
      }
      
    } catch (err) {
      console.error('❌ Ошибка при обновлении избранного:', err);
      alert(err.response?.data?.message || 'Ошибка при обновлении избранного');
    }
  };
  
  // Обработчик удаления локации
  const handleDelete = async () => {
    if (!location?.id) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту локацию?')) {
      try {
        const response = await api.delete(`/locations/${location.id}`);
        
        if (response.data.success) {
          console.log('✅ Локация удалена');
          alert('Локация успешно удалена');
          navigate('/locations');
        }
        
      } catch (err) {
        console.error('❌ Ошибка при удалении локации:', err);
        alert(err.response?.data?.message || 'Ошибка при удалении локации');
      }
    }
  };

  // Обработчик добавления нового отзыва
  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setReviewsCount(prev => prev + 1);
    
    // Пересчитываем средний рейтинг
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating;
    setAverageRating(totalRating / (reviews.length + 1));
  };

  // Обработчик добавления новой фотографии
  const handlePhotoAdded = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
  };

  // Рендер звезд рейтинга
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'text-warning' : 'text-muted'} 
        />
      );
    }
    return stars;
  };
  
  // Если идет загрузка
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-3">Загрузка информации о локации...</p>
      </Container>
    );
  }
  
  // Если ошибка
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка загрузки</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/locations')}>
          Вернуться к списку локаций
        </Button>
      </Container>
    );
  }
  
  // Если локация не найдена
  if (!location) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Локация не найдена</Alert.Heading>
          <p>Запрашиваемая локация не существует или была удалена.</p>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/locations')}>
          Вернуться к списку локаций
        </Button>
      </Container>
    );
  }
  
  const isOwner = isAuthenticated && user && location.created_by === user.id;
  const mapCenter = location.longitude && location.latitude 
    ? [parseFloat(location.latitude), parseFloat(location.longitude)]
    : [55.751244, 37.618423];
  
  return (
    <Container className="py-5">
      {/* ЗАГОЛОВОК И КНОПКИ */}
      <Row className="mb-4">
        <Col>
          <h1>{location.name}</h1>
          <div className="d-flex align-items-center mb-2">
            <div className="me-3">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2 text-muted">
                {averageRating.toFixed(1)} ({reviewsCount} отзывов)
              </span>
            </div>
          </div>
          <p className="text-muted">
            <FaMapMarkerAlt className="me-1" />
            {location.address || 'Адрес не указан'}
          </p>
          <p className="text-muted">
            Добавил: {location.creator_username || 'Неизвестный пользователь'}
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {isAuthenticated ? (
            <Button 
              variant={isFavorite ? "danger" : "outline-danger"}
              className="me-2"
              onClick={handleFavoriteToggle}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />} 
              {isFavorite ? ' В избранном' : ' В избранное'}
            </Button>
          ) : (
            <Button variant="outline-secondary" disabled className="me-2">
              <FaRegHeart /> Войдите, чтобы добавить в избранное
            </Button>
          )}
          
          {isOwner && (
            <>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate(`/locations/${location.id}/edit`)}
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
      
      {/* ИЗОБРАЖЕНИЕ */}
      {location.image_url && (
        <Row className="mb-4">
          <Col md={12}>
            <img 
              src={location.image_url} 
              alt={location.name}
              className="img-fluid rounded"
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Col>
        </Row>
      )}

      {/* КАРТА */}
      <Row className="mb-4">
        <Col md={12}>
          <h3>Расположение на карте</h3>
          <div style={{ 
            width: '100%', 
            height: '400px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <MapComponent
              center={mapCenter}
              zoom={15}
              height="400px"
              interactive={false}
              selectedLocation={{
                coordinates: mapCenter,
                name: location.name,
                address: location.address || 'Адрес не указан'
              }}
            />
          </div>
        </Col>
      </Row>
      
      {/* ТАБЫ */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'info'}
                onClick={() => setActiveTab('info')}
                style={{ cursor: 'pointer' }}
              >
                📋 Информация
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'photos'}
                onClick={() => setActiveTab('photos')}
                style={{ cursor: 'pointer' }}
              >
                <FaCamera className="me-1" />
                Фотографии ({photos.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                style={{ cursor: 'pointer' }}
              >
                <FaComment className="me-1" />
                Отзывы ({reviewsCount})
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          {/* СОДЕРЖИМОЕ ТАБОВ */}
          <div className="tab-content">
            {activeTab === 'info' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={8}>
                    <h3>Описание</h3>
                    <p>{location.description || 'Описание не указано'}</p>
                    
                    <h4>Дополнительная информация</h4>
                    <div className="location-info">
                      {location.category_name && (
                        <p><strong>Категория:</strong> {location.category_name}</p>
                      )}
                      
                      {location.best_time_of_day && (
                        <p><strong>Лучшее время суток:</strong> {location.best_time_of_day}</p>
                      )}
                      
                      {location.accessibility && (
                        <p><strong>Доступность:</strong> {location.accessibility}</p>
                      )}
                      
                      {location.difficulty_level && (
                        <p><strong>Уровень сложности:</strong> {location.difficulty_level}/5</p>
                      )}
                      
                      {location.tags && (
                        <p><strong>Теги:</strong> {location.tags}</p>
                      )}
                      
                      <p><strong>Дата добавления:</strong> {new Date(location.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <h4>Координаты</h4>
                    <p><strong>Широта:</strong> {location.latitude || 'Не указана'}</p>
                    <p><strong>Долгота:</strong> {location.longitude || 'Не указана'}</p>
                    
                    <h4>Статистика</h4>
                    <p><strong>Рейтинг:</strong> {averageRating.toFixed(1)}/5</p>
                    <p><strong>Отзывов:</strong> {reviewsCount}</p>
                    <p><strong>Фотографий:</strong> {photos.length}</p>
                  </Col>
                </Row>
              </div>
            )}
            
            {activeTab === 'photos' && (
              <div className="tab-pane active">
                <h3>Фотографии</h3>
                {isAuthenticated ? (
                  <PhotoGallery 
                    locationId={location.id} 
                    photos={photos}
                    onPhotoAdded={handlePhotoAdded}
                  />
                ) : (
                  <Alert variant="info">
                    <Alert.Heading>Войдите, чтобы просматривать и добавлять фотографии</Alert.Heading>
                    <p>Зарегистрируйтесь или войдите в систему, чтобы получить доступ к галерее фотографий.</p>
                  </Alert>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="tab-pane active">
                <h3>Отзывы и оценки</h3>
                {isAuthenticated ? (
                  <>
                    <div className="mb-4">
                      <h4>Оставить отзыв</h4>
                      <ReviewForm 
                        locationId={location.id} 
                        onReviewAdded={handleReviewAdded}
                      />
                    </div>
                    
                    <div>
                      <h4>Все отзывы</h4>
                      <ReviewList 
                        locationId={location.id}
                        reviews={reviews}
                      />
                    </div>
                  </>
                ) : (
                  <Alert variant="info">
                    <Alert.Heading>Войдите, чтобы просматривать и оставлять отзывы</Alert.Heading>
                    <p>Зарегистрируйтесь или войдите в систему, чтобы читать отзывы других пользователей и оставлять свои.</p>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
      
      {/* КНОПКА ВОЗВРАТА */}
      <Row>
        <Col>
          <Button variant="secondary" onClick={() => navigate('/locations')}>
            ← Вернуться к списку локаций
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default LocationDetailPage;
