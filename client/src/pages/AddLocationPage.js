// client/src/pages/AddLocationPage.js - ПОЛНАЯ ВЕРСИЯ СО ВСЕМИ ФИЛЬТРАМИ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapComponent from '../components/map/MapComponent';
import { createLocation } from '../redux/slices/locationSlice';
import api from '../services/api';

const AddLocationPage = () => {
  const [formData, setFormData] = useState({
    // Основная информация
    name: '',
    description: '',
    category_id: '',
    coordinates: null,
    address: '',
    tags: '',
    
    // Базовые характеристики
    accessibility: '',
    best_time_of_day: '',
    difficulty_level: 1,
    
    // ДОБАВЛЕНО: Фотографические характеристики
    photo_type: '',
    best_season: '',
    lighting_type: '',
    camera_angle: '',
    
    // ДОБАВЛЕНО: Практические характеристики
    transport_type: '',
    cost_type: '',
    popularity_level: '',
    physical_preparation: '',
    
    // ДОБАВЛЕНО: Технические характеристики
    suitable_for: '',
    equipment_needed: '',
    parking_available: '',
    entrance_fee: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { creating, createError } = useSelector(state => state.locations);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        console.log('📂 Загрузка категорий для формы добавления...');
        
        const response = await api.get('/categories');
        
        if (response.data.success) {
          setCategories(response.data.categories);
          console.log('✅ Категории загружены для формы добавления:', response.data.categories.length);
        } else {
          console.error('❌ Ошибка загрузки категорий:', response.data.message);
          setError('Не удалось загрузить категории');
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке категорий:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    if (createError) {
      setError(createError);
      setLoading(false);
    }
  }, [createError]);

  const handleLocationSelect = (locationData) => {
    console.log('Выбрана локация:', locationData);
    
    setSelectedLocation(locationData);
    setFormData(prev => ({
      ...prev,
      coordinates: locationData.coordinates,
      address: locationData.address,
      name: prev.name || locationData.name
    }));
    
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.currentTarget;
    setValidated(true);
    
    if (!formData.name.trim()) {
      setError('Название локации обязательно');
      return;
    }

    if (!formData.coordinates) {
      setError('Выберите локацию на карте');
      return;
    }

    if (form.checkValidity() === false) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const locationData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        coordinates: formData.coordinates,
        address: formData.address || `${formData.coordinates[0].toFixed(6)}, ${formData.coordinates[1].toFixed(6)}`,
        category_id: parseInt(formData.category_id) || 1,
        
        // Базовые характеристики
        best_time_of_day: formData.best_time_of_day || null,
        accessibility: formData.accessibility || null,
        difficulty_level: parseInt(formData.difficulty_level) || 1,
        tags: formData.tags || null,
        
        // Фотографические характеристики
        photo_type: formData.photo_type || null,
        best_season: formData.best_season || null,
        lighting_type: formData.lighting_type || null,
        camera_angle: formData.camera_angle || null,
        
        // Практические характеристики
        transport_type: formData.transport_type || null,
        cost_type: formData.cost_type || null,
        popularity_level: formData.popularity_level || null,
        physical_preparation: formData.physical_preparation || null,
        
        // Технические характеристики
        suitable_for: formData.suitable_for || null,
        equipment_needed: formData.equipment_needed || null,
        parking_available: formData.parking_available || null,
        entrance_fee: formData.entrance_fee || null
      };

      console.log('📤 Отправляем данные локации:', locationData);

      const result = await dispatch(createLocation(locationData));
      
      if (createLocation.fulfilled.match(result)) {
        console.log('✅ Локация создана успешно:', result.payload);
        navigate('/locations');
      } else {
        console.error('❌ Ошибка создания локации:', result.error);
        setError(result.error?.message || 'Ошибка при создании локации');
      }
    } catch (err) {
      console.error('❌ Ошибка создания локации:', err);
      setError('Ошибка при создании локации');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && selectedLocation && selectedLocation.coordinates;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">📍 Добавить новую локацию</h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <strong>Ошибка:</strong> {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
                <h5 className="text-primary mb-3">📋 Основная информация</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Название локации *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Введите название локации"
                        required
                        isInvalid={validated && !formData.name.trim()}
                      />
                      <Form.Control.Feedback type="invalid">
                        Название локации обязательно
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Категория *</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        disabled={categoriesLoading}
                      >
                        <option value="">
                          {categoriesLoading ? 'Загрузка категорий...' : 'Выберите категорию'}
                        </option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Описание локации..."
                  />
                </Form.Group>

                {/* ФОТОГРАФИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                <hr />
                <h5 className="text-primary mb-3">📸 Фотографические характеристики</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>📸 Тип съемки</Form.Label>
                      <Form.Select
                        name="photo_type"
                        value={formData.photo_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Любой тип</option>
                        <option value="портрет">Портрет</option>
                        <option value="пейзаж">Пейзаж</option>
                        <option value="макро">Макро</option>
                        <option value="архитектура">Архитектура</option>
                        <option value="street">Street фото</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>🌅 Лучший сезон</Form.Label>
                      <Form.Select
                        name="best_season"
                        value={formData.best_season}
                        onChange={handleInputChange}
                      >
                        <option value="">Любой сезон</option>
                        <option value="весна">Весна</option>
                        <option value="лето">Лето</option>
                        <option value="осень">Осень</option>
                        <option value="зима">Зима</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>☀️ Освещение</Form.Label>
                      <Form.Select
                        name="lighting_type"
                        value={formData.lighting_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Любое освещение</option>
                        <option value="золотой_час">Золотой час</option>
                        <option value="синий_час">Синий час</option>
                        <option value="дневной_свет">Дневной свет</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>📐 Ракурс</Form.Label>
                      <Form.Select
                        name="camera_angle"
                        value={formData.camera_angle}
                        onChange={handleInputChange}
                      >
                        <option value="">Любой ракурс</option>
                        <option value="сверху">Сверху</option>
                        <option value="снизу">Снизу</option>
                        <option value="на_уровне_глаз">На уровне глаз</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* ПРАКТИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                <hr />
                <h5 className="text-success mb-3">🚗 Практические характеристики</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>🚗 Транспорт</Form.Label>
                      <Form.Select
                        name="transport_type"
                        value={formData.transport_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Любой транспорт</option>
                        <option value="пешком">Пешком</option>
                        <option value="на_машине">На машине</option>
                        <option value="общественный">Общественный транспорт</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>💰 Стоимость</Form.Label>
                      <Form.Select
                        name="cost_type"
                        value={formData.cost_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Любая стоимость</option>
                        <option value="бесплатно">Бесплатно</option>
                        <option value="платно">Платно</option>
                        <option value="разрешение">Требует разрешение</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>👥 Популярность</Form.Label>
                      <Form.Select
                        name="popularity_level"
                        value={formData.popularity_level}
                        onChange={handleInputChange}
                      >
                        <option value="">Любая популярность</option>
                        <option value="скрытые">Скрытые места</option>
                        <option value="популярные">Популярные</option>
                        <option value="туристические">Туристические</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>🏃 Физическая подготовка</Form.Label>
                      <Form.Select
                        name="physical_preparation"
                        value={formData.physical_preparation}
                        onChange={handleInputChange}
                      >
                        <option value="">Любая подготовка</option>
                        <option value="легко">Легко</option>
                        <option value="средне">Средне</option>
                        <option value="сложно">Сложно</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
                <hr />
                <h5 className="text-warning mb-3">📱 Технические характеристики</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>📱 Подходит для</Form.Label>
                      <Form.Select
                        name="suitable_for"
                        value={formData.suitable_for}
                        onChange={handleInputChange}
                      >
                        <option value="">Любая платформа</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="профессиональная">Профессиональная съемка</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>🎥 Оборудование</Form.Label>
                      <Form.Select
                        name="equipment_needed"
                        value={formData.equipment_needed}
                        onChange={handleInputChange}
                      >
                        <option value="">Любое оборудование</option>
                        <option value="телефон">Телефон</option>
                        <option value="фотоаппарат">Фотоаппарат</option>
                        <option value="профессиональное">Профессиональное</option>
                        <option value="дрон">Дрон</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>🅿️ Парковка</Form.Label>
                      <Form.Select
                        name="parking_available"
                        value={formData.parking_available}
                        onChange={handleInputChange}
                      >
                        <option value="">Не указано</option>
                        <option value="есть">Есть парковка</option>
                        <option value="нет">Нет парковки</option>
                        <option value="платная">Платная парковка</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>💳 Входная плата</Form.Label>
                      <Form.Control
                        type="text"
                        name="entrance_fee"
                        value={formData.entrance_fee}
                        onChange={handleInputChange}
                        placeholder="Например: 500 руб"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* БАЗОВЫЕ ХАРАКТЕРИСТИКИ */}
                <hr />
                <h5 className="text-info mb-3">⚙️ Базовые характеристики</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>♿ Доступность</Form.Label>
                      <Form.Select
                        name="accessibility"
                        value={formData.accessibility}
                        onChange={handleInputChange}
                      >
                        <option value="">Выберите доступность</option>
                        <option value="легкая">Легкая</option>
                        <option value="средняя">Средняя</option>
                        <option value="сложная">Сложная</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>🕐 Время суток</Form.Label>
                      <Form.Select
                        name="best_time_of_day"
                        value={formData.best_time_of_day}
                        onChange={handleInputChange}
                      >
                        <option value="">Любое время</option>
                        <option value="утро">Утро</option>
                        <option value="день">День</option>
                        <option value="вечер">Вечер</option>
                        <option value="ночь">Ночь</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>⚡ Сложность: {formData.difficulty_level}</Form.Label>
                      <Form.Range
                        name="difficulty_level"
                        min={1}
                        max={5}
                        value={formData.difficulty_level}
                        onChange={handleInputChange}
                      />
                      <Form.Text className="text-muted">
                        1 - Очень легко, 5 - Очень сложно
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>🏷️ Теги</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="закат, природа, река (через запятую)"
                  />
                  <Form.Text className="text-muted">
                    Добавьте теги через запятую для лучшего поиска
                  </Form.Text>
                </Form.Group>

                {/* КАРТА */}
                <hr />
                <Form.Group className="mb-4">
                  <Form.Label>🗺️ Выберите локацию на карте *</Form.Label>
                  <div className="border rounded p-2" style={{ minHeight: '350px' }}>
                    <MapComponent
                      center={[55.751244, 37.618423]}
                      zoom={10}
                      height="320px"
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      interactive={true}
                    />
                  </div>
                  {selectedLocation && (
                    <div className="mt-2">
                      <small className="text-success">
                        ✅ Выбрано: {selectedLocation.address}
                      </small>
                    </div>
                  )}
                  {validated && !formData.coordinates && (
                    <div className="text-danger mt-1">
                      <small>Пожалуйста, выберите локацию на карте</small>
                    </div>
                  )}
                </Form.Group>

                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/locations')}
                    disabled={loading || creating}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!isFormValid || loading || creating || categoriesLoading}
                    size="lg"
                  >
                    {(loading || creating) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Создание...
                      </>
                    ) : (
                      '📍 Создать локацию'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddLocationPage;
