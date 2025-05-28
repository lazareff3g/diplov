// client/src/pages/LocationDetailPage.js - ПОЛНАЯ ВЕРСИЯ С РАСШИРЕННЫМИ ПОЛЯМИ И ЛОКАЛИЗАЦИЕЙ
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Alert, Spinner, Nav, Card, Modal, Form } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaMapMarkerAlt, FaStar, FaCamera, FaComment, FaPlus } from 'react-icons/fa';
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
  
  // Состояние для модального окна загрузки фото
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // ДОБАВЛЕНО: Функции локализации параметров
  const getLocalizedTime = (time) => {
    const timeMap = {
      'утро': 'Утро', 'день': 'День', 'вечер': 'Вечер', 'ночь': 'Ночь',
      'morning': 'Утро', 'day': 'День', 'evening': 'Вечер', 'night': 'Ночь',
      'any': 'Любое время'
    };
    return timeMap[time] || time;
  };

  const getLocalizedAccessibility = (accessibility) => {
    const accessibilityMap = {
      'легкая': 'Легкая', 'средняя': 'Средняя', 'сложная': 'Сложная',
      'easy': 'Легкая', 'moderate': 'Средняя', 'difficult': 'Сложная', 'expert': 'Экспертная'
    };
    return accessibilityMap[accessibility] || accessibility;
  };

  const getLocalizedPhotoType = (photoType) => {
    const photoTypeMap = {
      'портрет': 'Портрет', 'пейзаж': 'Пейзаж', 'макро': 'Макро',
      'архитектура': 'Архитектура', 'street': 'Стрит фото',
      'portrait': 'Портрет', 'landscape': 'Пейзаж', 'macro': 'Макро', 'architecture': 'Архитектура'
    };
    return photoTypeMap[photoType] || photoType;
  };

  const getLocalizedSeason = (season) => {
    const seasonMap = {
      'весна': 'Весна', 'лето': 'Лето', 'осень': 'Осень', 'зима': 'Зима',
      'spring': 'Весна', 'summer': 'Лето', 'autumn': 'Осень', 'winter': 'Зима'
    };
    return seasonMap[season] || season;
  };

  const getLocalizedLighting = (lighting) => {
    const lightingMap = {
      'золотой_час': 'Золотой час', 'синий_час': 'Синий час', 'дневной_свет': 'Дневной свет',
      'golden_hour': 'Золотой час', 'blue_hour': 'Синий час', 'daylight': 'Дневной свет'
    };
    return lightingMap[lighting] || lighting;
  };

  const getLocalizedTransport = (transport) => {
    const transportMap = {
      'пешком': 'Пешком', 'на_машине': 'На машине', 'общественный': 'Общественный транспорт',
      'walking': 'Пешком', 'car': 'На машине', 'public_transport': 'Общественный транспорт'
    };
    return transportMap[transport] || transport;
  };

  const getLocalizedCost = (cost) => {
    const costMap = {
      'бесплатно': 'Бесплатно', 'платно': 'Платно', 'разрешение': 'Требует разрешение',
      'free': 'Бесплатно', 'paid': 'Платно', 'permission': 'Требует разрешение'
    };
    return costMap[cost] || cost;
  };

  const getLocalizedPopularity = (popularity) => {
    const popularityMap = {
      'скрытые': 'Скрытые места', 'популярные': 'Популярные', 'туристические': 'Туристические',
      'hidden': 'Скрытые места', 'popular': 'Популярные', 'tourist': 'Туристические'
    };
    return popularityMap[popularity] || popularity;
  };

  const getLocalizedPhysicalPrep = (prep) => {
    const prepMap = {
      'легко': 'Легко', 'средне': 'Средне', 'сложно': 'Сложно',
      'easy': 'Легко', 'medium': 'Средне', 'hard': 'Сложно'
    };
    return prepMap[prep] || prep;
  };

  const getLocalizedPlatform = (platform) => {
    const platformMap = {
      'instagram': 'Instagram', 'tiktok': 'TikTok', 'профессиональная': 'Профессиональная съемка',
      'professional': 'Профессиональная съемка'
    };
    return platformMap[platform] || platform;
  };

  const getLocalizedEquipment = (equipment) => {
    const equipmentMap = {
      'телефон': 'Телефон', 'фотоаппарат': 'Фотоаппарат', 'профессиональное': 'Профессиональное', 'дрон': 'Дрон',
      'phone': 'Телефон', 'camera': 'Фотоаппарат', 'professional': 'Профессиональное', 'drone': 'Дрон'
    };
    return equipmentMap[equipment] || equipment;
  };

  const getLocalizedParking = (parking) => {
    const parkingMap = {
      'есть': 'Есть парковка', 'нет': 'Нет парковки', 'платная': 'Платная парковка',
      'available': 'Есть парковка', 'not_available': 'Нет парковки', 'paid': 'Платная парковка'
    };
    return parkingMap[parking] || parking;
  };
  
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

  // Обработчик удаления фото
  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту фотографию?')) {
      try {
        const response = await api.delete(`/photos/${photoId}`);
        
        if (response.data.success) {
          // Удаляем фото из локального состояния
          setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
          alert('Фотография успешно удалена!');
        } else {
          throw new Error(response.data.message || 'Ошибка удаления');
        }
      } catch (error) {
        console.error('Ошибка удаления фото:', error);
        alert('Ошибка при удалении фотографии');
      }
    }
  };

  // Обработчик выбора файла
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Обработчик загрузки фото
  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      alert('Выберите файл для загрузки');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('location_id', location.id);
      formData.append('description', photoCaption);

      const response = await api.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Фотография успешно загружена!');
        setShowPhotoModal(false);
        setSelectedFile(null);
        setPhotoCaption('');
        
        // Добавляем новое фото в список
        handlePhotoAdded(response.data.photo);
      } else {
        throw new Error(response.data.message || 'Ошибка загрузки');
      }

    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      alert('Ошибка загрузки фотографии');
    } finally {
      setUploading(false);
    }
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
                    
                    {/* ДОБАВЛЕНО: ФОТОГРАФИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                    {(location.photo_type || location.best_season || location.lighting_type || location.camera_angle) && (
                      <>
                        <h4 className="text-primary">📸 Фотографические характеристики</h4>
                        <div className="location-info">
                          {location.photo_type && (
                            <p><strong>Тип съемки:</strong> {getLocalizedPhotoType(location.photo_type)}</p>
                          )}
                          {location.best_season && (
                            <p><strong>Лучший сезон:</strong> {getLocalizedSeason(location.best_season)}</p>
                          )}
                          {location.lighting_type && (
                            <p><strong>Освещение:</strong> {getLocalizedLighting(location.lighting_type)}</p>
                          )}
                          {location.camera_angle && (
                            <p><strong>Ракурс:</strong> {location.camera_angle}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* ДОБАВЛЕНО: ПРАКТИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                    {(location.transport_type || location.cost_type || location.popularity_level || location.physical_preparation) && (
                      <>
                        <h4 className="text-success">🚗 Практические характеристики</h4>
                        <div className="location-info">
                          {location.transport_type && (
                            <p><strong>Транспорт:</strong> {getLocalizedTransport(location.transport_type)}</p>
                          )}
                          {location.cost_type && (
                            <p><strong>Стоимость:</strong> {getLocalizedCost(location.cost_type)}</p>
                          )}
                          {location.popularity_level && (
                            <p><strong>Популярность:</strong> {getLocalizedPopularity(location.popularity_level)}</p>
                          )}
                          {location.physical_preparation && (
                            <p><strong>Физическая подготовка:</strong> {getLocalizedPhysicalPrep(location.physical_preparation)}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* ДОБАВЛЕНО: ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                    {(location.suitable_for || location.equipment_needed || location.parking_available || location.entrance_fee) && (
                      <>
                        <h4 className="text-warning">📱 Технические характеристики</h4>
                        <div className="location-info">
                          {location.suitable_for && (
                            <p><strong>Подходит для:</strong> {getLocalizedPlatform(location.suitable_for)}</p>
                          )}
                          {location.equipment_needed && (
                            <p><strong>Необходимое оборудование:</strong> {getLocalizedEquipment(location.equipment_needed)}</p>
                          )}
                          {location.parking_available && (
                            <p><strong>Парковка:</strong> {getLocalizedParking(location.parking_available)}</p>
                          )}
                          {location.entrance_fee && (
                            <p><strong>Входная плата:</strong> {location.entrance_fee}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* БАЗОВЫЕ ХАРАКТЕРИСТИКИ */}
                    <h4 className="text-info">⚙️ Базовые характеристики</h4>
                    <div className="location-info">
                      {location.category_name && (
                        <p><strong>Категория:</strong> {location.category_name}</p>
                      )}
                      {location.best_time_of_day && (
                        <p><strong>Лучшее время суток:</strong> {getLocalizedTime(location.best_time_of_day)}</p>
                      )}
                      {location.accessibility && (
                        <p><strong>Доступность:</strong> {getLocalizedAccessibility(location.accessibility)}</p>
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
            
            {/* ТАБ ФОТОГРАФИЙ С КНОПКАМИ УДАЛЕНИЯ */}
            {activeTab === 'photos' && (
              <div className="tab-pane active">
                <h3>Фотографии</h3>
                
                {/* КНОПКА ДОБАВЛЕНИЯ ФОТО */}
                {isAuthenticated && (
                  <div className="mb-3">
                    <Button 
                      variant="primary" 
                      onClick={() => setShowPhotoModal(true)}
                      className="mb-3"
                    >
                      <FaPlus className="me-2" />
                      Добавить фотографию
                    </Button>
                  </div>
                )}
                
                {/* ГАЛЕРЕЯ ФОТОГРАФИЙ С КНОПКАМИ УДАЛЕНИЯ */}
                {photos.length === 0 ? (
                  <Alert variant="info">
                    <Alert.Heading>Пока нет фотографий</Alert.Heading>
                    <p>Станьте первым, кто добавит фотографию этого места!</p>
                  </Alert>
                ) : (
                  <Row>
                    {photos.map((photo) => (
                      <Col md={4} key={photo.id} className="mb-3">
                        <Card>
                          <div style={{ position: 'relative' }}>
                            <Card.Img 
                              variant="top" 
                              src={photo.url} 
                              style={{ height: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Изображение+недоступно';
                              }}
                            />
                            {/* Кнопка удаления фото */}
                            {isAuthenticated && user && photo.user_id === user.id && (
                              <Button
                                variant="danger"
                                size="sm"
                                style={{
                                  position: 'absolute',
                                  top: '5px',
                                  right: '5px',
                                  borderRadius: '50%',
                                  width: '30px',
                                  height: '30px',
                                  padding: '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onClick={() => handleDeletePhoto(photo.id)}
                                title="Удалить фотографию"
                              >
                                <FaTrash size={12} />
                              </Button>
                            )}
                          </div>
                          <Card.Body>
                            {photo.description && (
                              <Card.Text>{photo.description}</Card.Text>
                            )}
                            <small className="text-muted">
                              Добавил: {photo.username || 'Неизвестный'}
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
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

      {/* МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ФОТО */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить фотографию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Выберите изображение</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <Form.Text className="text-muted">
                Максимальный размер: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
              </Form.Text>
            </Form.Group>

            {selectedFile && (
              <Form.Group className="mb-3">
                <Form.Label>Предварительный просмотр</Form.Label>
                <div>
                  <img 
                    src={URL.createObjectURL(selectedFile)}
                    alt="Предварительный просмотр"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Описание (необязательно)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Добавьте описание к фотографии..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowPhotoModal(false)}
            disabled={uploading}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePhotoUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Загрузка...' : 'Загрузить фото'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LocationDetailPage;
