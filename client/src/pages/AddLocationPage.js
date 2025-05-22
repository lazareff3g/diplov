import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';
import { createLocationStart, createLocationSuccess, createLocationFailure } from '../redux/slices/locationSlice';
import locationService from '../services/locationService';
import api from '../services/api';
import './AddLocationPage.css';

const AddLocationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.locations);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coordinates: null,
    address: '',
    category_id: '',
    best_time_of_day: '',
    best_season: '',
    accessibility: '',
    difficulty_level: '',
    permission_required: false
  });
  const [validated, setValidated] = useState(false);
  const [mapState, setMapState] = useState({
    center: [55.751244, 37.618423], // Москва
    zoom: 10
  });

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Обработчик выбора адреса на карте
  const handleMapClick = (e) => {
    const coords = e.get('coords');
    
    // Обратное геокодирование для получения адреса
    e.originalEvent.map.geocode(coords).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      const address = firstGeoObject.getAddressLine();
      
      setFormData(prev => ({
        ...prev,
        coordinates: coords, // [latitude, longitude]
        address
      }));
      
      setMapState({
        center: coords,
        zoom: 15
      });
    });
  };

  // Обработчик поиска адреса
  const handleAddressSearch = () => {
    if (!formData.address) return;
    
    // Геокодирование для получения координат по адресу
    window.ymaps.geocode(formData.address).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        
        setFormData(prev => ({
          ...prev,
          coordinates: coords // [latitude, longitude]
        }));
        
        setMapState({
          center: coords,
          zoom: 15
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || !formData.coordinates) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      dispatch(createLocationStart());
      const newLocation = await locationService.createLocation(formData);
      dispatch(createLocationSuccess(newLocation));
      navigate(`/locations/${newLocation.id}`);
    } catch (err) {
      dispatch(createLocationFailure(err.response?.data?.message || 'Ошибка при создании локации'));
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Добавление новой локации</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>Основная информация</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Название</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Введите название локации"
                    title="Введите название места для фотографии"
                  />
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, введите название локации.
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Укажите точное и информативное название места
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Категория</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    title="Выберите категорию, к которой относится место"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id} title={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, выберите категорию.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Введите описание локации"
                title="Подробно опишите место, его особенности и рекомендации для фотографов"
              />
              <Form.Control.Feedback type="invalid">
                Пожалуйста, введите описание локации.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Опишите особенности места, что можно фотографировать, какие ракурсы лучше использовать
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>Местоположение</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Адрес</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Введите адрес"
                  className="me-2"
                  title="Введите точный адрес места или ближайший ориентир"
                />
                <Button variant="outline-primary" onClick={handleAddressSearch} title="Найти введенный адрес на карте">
                  Найти
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                Пожалуйста, введите адрес.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Укажите точный адрес или ближайший ориентир
              </Form.Text>
            </Form.Group>
            
            <div className="mb-3">
              <YMaps query={{ apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY }}>
                <Map
                  state={mapState}
                  width="100%"
                  height="400px"
                  onClick={handleMapClick}
                  modules={['geocode']}
                >
                  <SearchControl options={{ float: 'right' }} />
                  {formData.coordinates && (
                    <Placemark
                      geometry={formData.coordinates}
                      options={{ preset: 'islands#redIcon', draggable: true }}
                      onDragEnd={e => {
                        const coords = e.get('target').geometry.getCoordinates();
                        setFormData(prev => ({ ...prev, coordinates: coords }));
                        
                        // Обновление адреса при перетаскивании метки
                        e.originalEvent.map.geocode(coords).then((res) => {
                          const firstGeoObject = res.geoObjects.get(0);
                          const address = firstGeoObject.getAddressLine();
                          setFormData(prev => ({ ...prev, address }));
                        });
                      }}
                      title="Перетащите метку для уточнения местоположения"
                    />
                  )}
                </Map>
              </YMaps>
              {validated && !formData.coordinates && (
                <div className="text-danger mt-2">
                  Пожалуйста, выберите местоположение на карте.
                </div>
              )}
              {formData.coordinates && (
                <div className="mt-2 coordinates-display">
                  <strong>Координаты:</strong> Широта: {formData.coordinates[0].toFixed(6)}, Долгота: {formData.coordinates[1].toFixed(6)}
                </div>
              )}
              <Form.Text className="text-muted">
                Кликните на карте, чтобы указать точное местоположение, или перетащите метку для уточнения
              </Form.Text>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>Дополнительная информация</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Лучшее время суток</Form.Label>
                  <Form.Select
                    name="best_time_of_day"
                    value={formData.best_time_of_day}
                    onChange={handleChange}
                    title="Выберите оптимальное время суток для фотосъемки (необязательно)"
                  >
                    <option value="">Не указано</option>
                    <option value="morning">Утро</option>
                    <option value="afternoon">День</option>
                    <option value="evening">Вечер</option>
                    <option value="night">Ночь</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Необязательное поле. Укажите, в какое время суток место выглядит наиболее выигрышно
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Лучший сезон</Form.Label>
                  <Form.Select
                    name="best_season"
                    value={formData.best_season}
                    onChange={handleChange}
                    title="Выберите оптимальный сезон для фотосъемки (необязательно)"
                  >
                    <option value="">Не указано</option>
                    <option value="spring">Весна</option>
                    <option value="summer">Лето</option>
                    <option value="autumn">Осень</option>
                    <option value="winter">Зима</option>
                    <option value="any">Любой сезон</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Необязательное поле. Укажите, в какое время года место выглядит наиболее выигрышно
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Доступность</Form.Label>
                  <Form.Select
                    name="accessibility"
                    value={formData.accessibility}
                    onChange={handleChange}
                    required
                    title="Выберите способ добраться до места"
                  >
                    <option value="">Выберите тип доступности</option>
                    <option value="public_transport">Общественный транспорт</option>
                    <option value="car">Автомобиль</option>
                    <option value="walking">Пешком</option>
                    <option value="mixed">Смешанный</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, выберите тип доступности.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Уровень сложности</Form.Label>
                  <Form.Select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleChange}
                    required
                    title="Выберите уровень сложности доступа к месту"
                  >
                    <option value="">Выберите уровень сложности</option>
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, выберите уровень сложности.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="permission_required"
                label="Требуется разрешение для съемки"
                checked={formData.permission_required}
                onChange={handleChange}
                title="Отметьте, если для фотосъемки в этом месте требуется получить разрешение"
              />
              <Form.Text className="text-muted">
                Отметьте, если для фотосъемки в этом месте требуется получить разрешение от владельцев или администрации
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => navigate('/locations')}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Добавить локацию'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddLocationPage;
