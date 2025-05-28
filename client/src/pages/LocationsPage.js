// client/src/pages/LocationsPage.js - ПОЛНАЯ ВЕРСИЯ С ЛОКАЛИЗАЦИЕЙ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaList, FaMap, FaPlus, FaFilter, FaChevronDown, FaChevronUp, FaStar } from 'react-icons/fa';
import api from '../services/api';

const LocationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Базовые фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAccessibility, setSelectedAccessibility] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // 1. Фотографические характеристики
  const [selectedPhotoType, setSelectedPhotoType] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedLighting, setSelectedLighting] = useState('');
  const [selectedAngle, setSelectedAngle] = useState('');
  
  // 2. Практические характеристики
  const [selectedTransport, setSelectedTransport] = useState('');
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedPopularity, setSelectedPopularity] = useState('');
  const [selectedPhysicalPrep, setSelectedPhysicalPrep] = useState('');
  
  // 3. Технические фильтры
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedDateAdded, setSelectedDateAdded] = useState('');

  // ДОБАВЛЕНО: Функции локализации параметров
  const getLocalizedTime = (time) => {
    const timeMap = {
      'утро': 'Утро',
      'день': 'День', 
      'вечер': 'Вечер',
      'ночь': 'Ночь',
      'morning': 'Утро',
      'day': 'День',
      'evening': 'Вечер', 
      'night': 'Ночь',
      'any': 'Любое время'
    };
    return timeMap[time] || time;
  };

  const getLocalizedAccessibility = (accessibility) => {
    const accessibilityMap = {
      'легкая': 'Легкая',
      'средняя': 'Средняя',
      'сложная': 'Сложная',
      'easy': 'Легкая',
      'moderate': 'Средняя', 
      'difficult': 'Сложная',
      'expert': 'Экспертная'
    };
    return accessibilityMap[accessibility] || accessibility;
  };

  const getLocalizedPhotoType = (photoType) => {
    const photoTypeMap = {
      'портрет': 'Портрет',
      'пейзаж': 'Пейзаж',
      'макро': 'Макро',
      'архитектура': 'Архитектура',
      'street': 'Стрит фото',
      'portrait': 'Портрет',
      'landscape': 'Пейзаж',
      'macro': 'Макро',
      'architecture': 'Архитектура'
    };
    return photoTypeMap[photoType] || photoType;
  };

  const getLocalizedSeason = (season) => {
    const seasonMap = {
      'весна': 'Весна',
      'лето': 'Лето', 
      'осень': 'Осень',
      'зима': 'Зима',
      'spring': 'Весна',
      'summer': 'Лето',
      'autumn': 'Осень',
      'winter': 'Зима'
    };
    return seasonMap[season] || season;
  };

  const getLocalizedLighting = (lighting) => {
    const lightingMap = {
      'золотой_час': 'Золотой час',
      'синий_час': 'Синий час',
      'дневной_свет': 'Дневной свет',
      'golden_hour': 'Золотой час',
      'blue_hour': 'Синий час',
      'daylight': 'Дневной свет'
    };
    return lightingMap[lighting] || lighting;
  };

  const getLocalizedTransport = (transport) => {
    const transportMap = {
      'пешком': 'Пешком',
      'на_машине': 'На машине',
      'общественный': 'Общественный транспорт',
      'walking': 'Пешком',
      'car': 'На машине',
      'public_transport': 'Общественный транспорт',
    };
    return transportMap[transport] || transport;
  };

  const getLocalizedCost = (cost) => {
    const costMap = {
      'бесплатно': 'Бесплатно',
      'платно': 'Платно',
      'разрешение': 'Требует разрешение',
      'free': 'Бесплатно',
      'paid': 'Платно',
      'permission': 'Требует разрешение'
    };
    return costMap[cost] || cost;
  };

  const getLocalizedPopularity = (popularity) => {
    const popularityMap = {
      'скрытые': 'Скрытые места',
      'популярные': 'Популярные',
      'туристические': 'Туристические',
      'hidden': 'Скрытые места',
      'popular': 'Популярные',
      'tourist': 'Туристические'
    };
    return popularityMap[popularity] || popularity;
  };

  const getLocalizedPhysicalPrep = (prep) => {
    const prepMap = {
      'легко': 'Легко',
      'средне': 'Средне',
      'сложно': 'Сложно',
      'easy': 'Легко',
      'medium': 'Средне',
      'hard': 'Сложно'
    };
    return prepMap[prep] || prep;
  };

  const getLocalizedPlatform = (platform) => {
    const platformMap = {
      'instagram': 'Instagram',
      'tiktok': 'TikTok',
      'профессиональная': 'Профессиональная съемка',
      'professional': 'Профессиональная съемка'
    };
    return platformMap[platform] || platform;
  };

  const getLocalizedEquipment = (equipment) => {
    const equipmentMap = {
      'телефон': 'Телефон',
      'фотоаппарат': 'Фотоаппарат',
      'профессиональное': 'Профессиональное',
      'дрон': 'Дрон',
      'phone': 'Телефон',
      'camera': 'Фотоаппарат',
      'professional': 'Профессиональное',
      'drone': 'Дрон'
    };
    return equipmentMap[equipment] || equipment;
  };

  const getLocalizedParking = (parking) => {
    const parkingMap = {
      'есть': 'Есть парковка',
      'нет': 'Нет парковки',
      'платная': 'Платная парковка',
      'available': 'Есть парковка',
      'not_available': 'Нет парковки',
      'paid': 'Платная парковка'
    };
    return parkingMap[parking] || parking;
  };
  
  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('📂 Загрузка категорий...');
        const response = await api.get('/categories');
        
        if (response.data.success) {
          setCategories(response.data.categories);
          console.log('✅ Категории загружены:', response.data.categories.length);
        } else {
          console.error('❌ Ошибка загрузки категорий:', response.data.message);
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке категорий:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Загрузка локаций
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📍 Загрузка всех локаций...');
        
        const response = await api.get('/locations');
        
        if (response.data.success) {
          setLocations(response.data.locations);
          console.log('✅ Локации загружены:', response.data.locations.length);
        } else {
          throw new Error(response.data.message || 'Ошибка загрузки локаций');
        }
        
      } catch (err) {
        console.error('❌ Ошибка при загрузке локаций:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка при загрузке локаций');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  // Расширенная фильтрация локаций
  const filteredLocations = locations.filter(location => {
    // Базовые фильтры
    const matchesSearch = !searchTerm || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || location.category_id === parseInt(selectedCategory);
    const matchesTime = !selectedTime || location.best_time_of_day === selectedTime;
    const matchesAccessibility = !selectedAccessibility || location.accessibility === selectedAccessibility;
    const matchesDifficulty = !selectedDifficulty || location.difficulty_level === parseInt(selectedDifficulty);
    
    // Фотографические характеристики
    const matchesPhotoType = !selectedPhotoType || location.photo_type === selectedPhotoType;
    const matchesSeason = !selectedSeason || location.best_season === selectedSeason;
    const matchesLighting = !selectedLighting || location.lighting_type === selectedLighting;
    const matchesAngle = !selectedAngle || location.camera_angle === selectedAngle;
    
    // Практические характеристики
    const matchesTransport = !selectedTransport || location.transport_type === selectedTransport;
    const matchesCost = !selectedCost || location.cost_type === selectedCost;
    const matchesPopularity = !selectedPopularity || location.popularity_level === selectedPopularity;
    const matchesPhysicalPrep = !selectedPhysicalPrep || location.physical_preparation === selectedPhysicalPrep;
    
    // Технические фильтры
    const matchesPlatform = !selectedPlatform || location.suitable_for === selectedPlatform;
    const matchesRating = !selectedRating || 
      (selectedRating === '4' && location.average_rating >= 4) ||
      (selectedRating === '3' && location.average_rating >= 3);
    
    const matchesDateAdded = !selectedDateAdded || (() => {
      const locationDate = new Date(location.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - locationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedDateAdded) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'year': return diffDays <= 365;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesTime && matchesAccessibility && 
           matchesDifficulty && matchesPhotoType && matchesSeason && matchesLighting && 
           matchesAngle && matchesTransport && matchesCost && matchesPopularity && 
           matchesPhysicalPrep && matchesPlatform && matchesRating && matchesDateAdded;
  });

  // Обработчик клика по точке на карте
  const handleLocationSelect = (locationData) => {
    const foundLocation = locations.find(loc => 
      Math.abs(loc.latitude - locationData.coordinates[0]) < 0.001 &&
      Math.abs(loc.longitude - locationData.coordinates[1]) < 0.001
    );
    
    if (foundLocation) {
      navigate(`/locations/${foundLocation.id}`);
    }
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    // Базовые фильтры
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTime('');
    setSelectedAccessibility('');
    setSelectedDifficulty('');
    
    // Фотографические характеристики
    setSelectedPhotoType('');
    setSelectedSeason('');
    setSelectedLighting('');
    setSelectedAngle('');
    
    // Практические характеристики
    setSelectedTransport('');
    setSelectedCost('');
    setSelectedPopularity('');
    setSelectedPhysicalPrep('');
    
    // Технические фильтры
    setSelectedPlatform('');
    setSelectedRating('');
    setSelectedDateAdded('');
  };

  // Подсчет активных фильтров
  const getActiveFiltersCount = () => {
    const filters = [
      searchTerm, selectedCategory, selectedTime, selectedAccessibility, selectedDifficulty,
      selectedPhotoType, selectedSeason, selectedLighting, selectedAngle,
      selectedTransport, selectedCost, selectedPopularity, selectedPhysicalPrep,
      selectedPlatform, selectedRating, selectedDateAdded
    ];
    return filters.filter(filter => filter !== '').length;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка локаций...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка загрузки</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* ЗАГОЛОВОК И КНОПКИ */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              <FaMapMarkerAlt className="me-2 text-danger" />
              Локации для фотосъемки
            </h1>
            <div className="d-flex gap-2">
              {isAuthenticated && (
                <Button 
                  variant="primary"
                  onClick={() => navigate('/locations/add')}
                >
                  <FaPlus className="me-1" />
                  Добавить локацию
                </Button>
              )}
              
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                <FaList className="me-1" />
                Список
              </Button>
              
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('map')}
              >
                <FaMap className="me-1" />
                Карта
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* РАСШИРЕННЫЕ ФИЛЬТРЫ ПОИСКА */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFilter className="me-2" />
              Фильтры поиска
              {getActiveFiltersCount() > 0 && (
                <Badge bg="primary" className="ms-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </h5>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
              {showAdvancedFilters ? ' Скрыть' : ' Расширенные'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* БАЗОВЫЕ ФИЛЬТРЫ */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>🔍 Поиск</Form.Label>
              <Form.Control
                type="text"
                placeholder="Поиск по названию или описанию"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
          
          <Row>
            <Col md={3} className="mb-3">
              <Form.Label>📂 Категория</Form.Label>
              <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={3} className="mb-3">
              <Form.Label>🕐 Время суток</Form.Label>
              <Form.Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="">Любое время</option>
                <option value="утро">Утро</option>
                <option value="день">День</option>
                <option value="вечер">Вечер</option>
                <option value="ночь">Ночь</option>
              </Form.Select>
            </Col>
            
            <Col md={3} className="mb-3">
              <Form.Label>♿ Доступность</Form.Label>
              <Form.Select value={selectedAccessibility} onChange={(e) => setSelectedAccessibility(e.target.value)}>
                <option value="">Любая доступность</option>
                <option value="легкая">Легкая</option>
                <option value="средняя">Средняя</option>
                <option value="сложная">Сложная</option>
              </Form.Select>
            </Col>
            
            <Col md={3} className="mb-3">
              <Form.Label>⚡ Сложность</Form.Label>
              <Form.Select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="">Любая сложность</option>
                <option value="1">1 - Очень легко</option>
                <option value="2">2 - Легко</option>
                <option value="3">3 - Средне</option>
                <option value="4">4 - Сложно</option>
                <option value="5">5 - Очень сложно</option>
              </Form.Select>
            </Col>
          </Row>

          {/* РАСШИРЕННЫЕ ФИЛЬТРЫ */}
          {showAdvancedFilters && (
            <>
              {/* 1. ФОТОГРАФИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
              <hr />
              <h6 className="text-primary mb-3">📸 Фотографические характеристики</h6>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Label>📸 Тип съемки</Form.Label>
                  <Form.Select value={selectedPhotoType} onChange={(e) => setSelectedPhotoType(e.target.value)}>
                    <option value="">Любой тип</option>
                    <option value="портрет">Портрет</option>
                    <option value="пейзаж">Пейзаж</option>
                    <option value="макро">Макро</option>
                    <option value="архитектура">Архитектура</option>
                    <option value="street">Street фото</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>🌅 Лучший сезон</Form.Label>
                  <Form.Select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                    <option value="">Любой сезон</option>
                    <option value="весна">Весна</option>
                    <option value="лето">Лето</option>
                    <option value="осень">Осень</option>
                    <option value="зима">Зима</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>☀️ Освещение</Form.Label>
                  <Form.Select value={selectedLighting} onChange={(e) => setSelectedLighting(e.target.value)}>
                    <option value="">Любое освещение</option>
                    <option value="золотой_час">Золотой час</option>
                    <option value="синий_час">Синий час</option>
                    <option value="дневной_свет">Дневной свет</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>📐 Ракурс</Form.Label>
                  <Form.Select value={selectedAngle} onChange={(e) => setSelectedAngle(e.target.value)}>
                    <option value="">Любой ракурс</option>
                    <option value="сверху">Сверху</option>
                    <option value="снизу">Снизу</option>
                    <option value="на_уровне_глаз">На уровне глаз</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* 2. ПРАКТИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
              <hr />
              <h6 className="text-success mb-3">🚗 Практические характеристики</h6>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Label>🚗 Транспорт</Form.Label>
                  <Form.Select value={selectedTransport} onChange={(e) => setSelectedTransport(e.target.value)}>
                    <option value="">Любой транспорт</option>
                    <option value="пешком">Пешком</option>
                    <option value="на_машине">На машине</option>
                    <option value="общественный">Общественный транспорт</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>💰 Стоимость</Form.Label>
                  <Form.Select value={selectedCost} onChange={(e) => setSelectedCost(e.target.value)}>
                    <option value="">Любая стоимость</option>
                    <option value="бесплатно">Бесплатно</option>
                    <option value="платно">Платно</option>
                    <option value="разрешение">Требует разрешение</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>👥 Популярность</Form.Label>
                  <Form.Select value={selectedPopularity} onChange={(e) => setSelectedPopularity(e.target.value)}>
                    <option value="">Любая популярность</option>
                    <option value="скрытые">Скрытые места</option>
                    <option value="популярные">Популярные</option>
                    <option value="туристические">Туристические</option>
                  </Form.Select>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Label>🏃 Физическая подготовка</Form.Label>
                  <Form.Select value={selectedPhysicalPrep} onChange={(e) => setSelectedPhysicalPrep(e.target.value)}>
                    <option value="">Любая подготовка</option>
                    <option value="легко">Легко</option>
                    <option value="средне">Средне</option>
                    <option value="сложно">Сложно</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* 3. ТЕХНИЧЕСКИЕ ФИЛЬТРЫ */}
              <hr />
              <h6 className="text-warning mb-3">📱 Технические фильтры</h6>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Label>📱 Подходит для</Form.Label>
                  <Form.Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                    <option value="">Любая платформа</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="профессиональная">Профессиональная съемка</option>
                  </Form.Select>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Label>⭐ Рейтинг</Form.Label>
                  <Form.Select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                    <option value="">Любой рейтинг</option>
                    <option value="4">4+ звезды</option>
                    <option value="3">3+ звезды</option>
                  </Form.Select>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Label>📅 Добавлено</Form.Label>
                  <Form.Select value={selectedDateAdded} onChange={(e) => setSelectedDateAdded(e.target.value)}>
                    <option value="">За все время</option>
                    <option value="week">За неделю</option>
                    <option value="month">За месяц</option>
                    <option value="year">За год</option>
                  </Form.Select>
                </Col>
              </Row>
            </>
          )}
          
          {/* КНОПКИ УПРАВЛЕНИЯ ФИЛЬТРАМИ */}
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" disabled>
              Применить фильтры
            </Button>
            <Button variant="secondary" onClick={handleResetFilters}>
              Сбросить все
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline-danger" onClick={handleResetFilters}>
                Очистить ({getActiveFiltersCount()})
              </Button>
            )}
          </div>
          
          <div className="mt-2">
            <small className="text-muted">
              Найдено локаций: <strong>{filteredLocations.length}</strong> из {locations.length}
              {categories.length > 0 && (
                <span className="ms-3">
                  Категорий: <strong>{categories.length}</strong>
                </span>
              )}
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* ОБНОВЛЕННЫЙ СПИСОК ЛОКАЦИЙ С ЛОКАЛИЗАЦИЕЙ */}
      <div style={{ display: viewMode === 'list' ? 'block' : 'none' }}>
        <Row>
          {filteredLocations.length === 0 ? (
            <Col>
              <Alert variant="info">
                <Alert.Heading>Локации не найдены</Alert.Heading>
                <p>Попробуйте изменить параметры поиска или добавьте новую локацию.</p>
              </Alert>
            </Col>
          ) : (
            filteredLocations.map((location) => (
              <Col md={6} lg={4} key={location.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  {/* ЗАГОЛОВОК КАРТОЧКИ */}
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 text-primary">
                        {categories.find(cat => cat.id === location.category_id)?.icon} {' '}
                        {categories.find(cat => cat.id === location.category_id)?.name || 'Без категории'}
                      </h6>
                      {location.difficulty_level && (
                        <span className="badge bg-warning">
                          Сложность: {location.difficulty_level}/5
                        </span>
                      )}
                    </div>
                  </Card.Header>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h5">{location.name}</Card.Title>
                    
                    <Card.Text className="text-muted mb-3">
                      {location.description ? 
                        location.description.substring(0, 100) + '...' : 
                        'Описание не указано'
                      }
                    </Card.Text>

                    {/* ОСНОВНАЯ ИНФОРМАЦИЯ С ЛОКАЛИЗАЦИЕЙ */}
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <FaMapMarkerAlt className="me-1 text-danger" />
                        {location.address || 'Адрес не указан'}
                      </small>
                      
                      {location.best_time_of_day && (
                        <small className="text-muted d-block">
                          🕐 Лучшее время: {getLocalizedTime(location.best_time_of_day)}
                        </small>
                      )}
                      
                      {location.accessibility && (
                        <small className="text-muted d-block">
                          ♿ Доступность: {getLocalizedAccessibility(location.accessibility)}
                        </small>
                      )}
                    </div>

                    {/* ФОТОГРАФИЧЕСКИЕ ХАРАКТЕРИСТИКИ С ЛОКАЛИЗАЦИЕЙ */}
                    {(location.photo_type || location.best_season || location.lighting_type || location.camera_angle) && (
                      <div className="mb-3">
                        <h6 className="text-primary mb-2">📸 Фотосъемка</h6>
                        {location.photo_type && (
                          <small className="badge bg-primary me-1 mb-1">
                            {getLocalizedPhotoType(location.photo_type)}
                          </small>
                        )}
                        {location.best_season && (
                          <small className="badge bg-success me-1 mb-1">
                            🌅 {getLocalizedSeason(location.best_season)}
                          </small>
                        )}
                        {location.lighting_type && (
                          <small className="badge bg-warning me-1 mb-1">
                            ☀️ {getLocalizedLighting(location.lighting_type)}
                          </small>
                        )}
                        {location.camera_angle && (
                          <small className="badge bg-info me-1 mb-1">
                            📐 {location.camera_angle}
                          </small>
                        )}
                      </div>
                    )}

                    {/* ПРАКТИЧЕСКИЕ ХАРАКТЕРИСТИКИ С ЛОКАЛИЗАЦИЕЙ */}
                    {(location.transport_type || location.cost_type || location.popularity_level || location.physical_preparation) && (
                      <div className="mb-3">
                        <h6 className="text-success mb-2">🚗 Практическое</h6>
                        {location.transport_type && (
                          <small className="badge bg-secondary me-1 mb-1">
                            🚗 {getLocalizedTransport(location.transport_type)}
                          </small>
                        )}
                        {location.cost_type && (
                          <small className="badge bg-success me-1 mb-1">
                            💰 {getLocalizedCost(location.cost_type)}
                          </small>
                        )}
                        {location.popularity_level && (
                          <small className="badge bg-info me-1 mb-1">
                            👥 {getLocalizedPopularity(location.popularity_level)}
                          </small>
                        )}
                        {location.physical_preparation && (
                          <small className="badge bg-warning me-1 mb-1">
                            🏃 {getLocalizedPhysicalPrep(location.physical_preparation)}
                          </small>
                        )}
                      </div>
                    )}

                    {/* ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ С ЛОКАЛИЗАЦИЕЙ */}
                    {(location.suitable_for || location.equipment_needed || location.parking_available || location.entrance_fee) && (
                      <div className="mb-3">
                        <h6 className="text-warning mb-2">📱 Техническое</h6>
                        {location.suitable_for && (
                          <small className="badge bg-primary me-1 mb-1">
                            📱 {getLocalizedPlatform(location.suitable_for)}
                          </small>
                        )}
                        {location.equipment_needed && (
                          <small className="badge bg-secondary me-1 mb-1">
                            🎥 {getLocalizedEquipment(location.equipment_needed)}
                          </small>
                        )}
                        {location.parking_available && (
                          <small className="badge bg-success me-1 mb-1">
                            🅿️ {getLocalizedParking(location.parking_available)}
                          </small>
                        )}
                        {location.entrance_fee && (
                          <small className="badge bg-warning me-1 mb-1">
                            💳 {location.entrance_fee}
                          </small>
                        )}
                      </div>
                    )}

                    {/* ТЕГИ */}
                    {location.tags && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">🏷️ Теги</h6>
                        {location.tags.split(',').map((tag, index) => (
                          <small key={index} className="badge bg-light text-dark me-1 mb-1">
                            {tag.trim()}
                          </small>
                        ))}
                      </div>
                    )}

                    {/* СТАТИСТИКА */}
                    <div className="mb-3">
                      <div className="row text-center">
                        <div className="col-4">
                          <small className="text-muted d-block">Рейтинг</small>
                          <strong className="text-warning">
                            {location.average_rating ? (
                              <>
                                <FaStar className="me-1" />
                                {location.average_rating.toFixed(1)}
                              </>
                            ) : 'Нет'}
                          </strong>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">Отзывы</small>
                          <strong className="text-primary">
                            {location.reviews_count || 0}
                          </strong>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">Фото</small>
                          <strong className="text-success">
                            {location.photos_count || 0}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* КНОПКА ДЕЙСТВИЯ */}
                    <div className="mt-auto">
                      <Button 
                        variant="primary" 
                        className="w-100"
                        onClick={() => navigate(`/locations/${location.id}`)}
                      >
                        Подробнее →
                      </Button>
                    </div>
                  </Card.Body>

                  {/* ФУТЕР КАРТОЧКИ */}
                  <Card.Footer className="bg-light text-muted">
                    <small>
                      Добавлено: {new Date(location.created_at).toLocaleDateString('ru-RU')}
                      {location.creator_username && (
                        <span className="ms-2">• {location.creator_username}</span>
                      )}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>

      {/* КАРТА С ТОЧКАМИ */}
      <div style={{ display: viewMode === 'map' ? 'block' : 'none' }}>
        <Row>
          <Col>
            <Card>
              <Card.Body style={{ padding: 0 }}>
                <MapWithLocations 
                  locations={filteredLocations}
                  onLocationSelect={handleLocationSelect}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

// Компонент карты с множественными точками (остается без изменений)
const MapWithLocations = ({ locations, onLocationSelect }) => {
  const [map, setMap] = useState(null);
  const [objectManager, setObjectManager] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const createGeoJSON = () => {
    return {
      type: "FeatureCollection",
      features: locations.map((location) => {
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        
        return {
          type: "Feature",
          id: location.id,
          geometry: {
            type: "Point",
            coordinates: [lat, lng]
          },
          properties: {
            balloonContent: `
              <div style="padding: 10px;">
                <h5>${location.name}</h5>
                <p>${location.description || 'Описание не указано'}</p>
                <p><strong>Адрес:</strong> ${location.address || 'Не указан'}</p>
                <a href="/locations/${location.id}" style="color: #007bff;">Подробнее →</a>
              </div>
            `,
            clusterCaption: location.name,
            hintContent: location.name
          },
          options: {
            preset: 'islands#redDotIcon'
          }
        };
      })
    };
  };

  useEffect(() => {
    if (!window.ymaps && !isMapReady) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU&coordorder=latlong`;
      
      script.onload = () => {
        window.ymaps.ready(() => {
          const mapElement = document.getElementById('locations-map');
          if (!mapElement) {
            console.error('❌ Элемент locations-map не найден');
            return;
          }

          const mapInstance = new window.ymaps.Map('locations-map', {
            center: [55.751244, 37.618423],
            zoom: 10,
            controls: ['zoomControl', 'geolocationControl', 'searchControl']
          });

          const objectManagerInstance = new window.ymaps.ObjectManager({
            clusterize: true,
            gridSize: 64,
            clusterDisableClickZoom: false
          });

          mapInstance.geoObjects.add(objectManagerInstance);
          
          setMap(mapInstance);
          setObjectManager(objectManagerInstance);
          setIsMapReady(true);
          
          console.log('✅ Карта инициализирована');
        });
      };
      
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (objectManager && locations.length > 0 && isMapReady) {
      console.log('🔄 Обновление точек на карте:', locations.length);
      
      objectManager.removeAll();
      const geoJSON = createGeoJSON();
      objectManager.add(geoJSON);
      
      if (map) {
        const bounds = objectManager.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true });
        }
      }
    }
  }, [objectManager, locations, map, isMapReady]);

  return (
    <div 
      id="locations-map" 
      style={{ 
        width: '100%', 
        height: '600px',
        borderRadius: '8px',
        backgroundColor: isMapReady ? 'transparent' : '#f8f9fa'
      }} 
    >
      {!isMapReady && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#6c757d'
        }}>
          Загрузка карты...
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
