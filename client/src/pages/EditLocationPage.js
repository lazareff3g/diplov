// src/pages/EditLocationPage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';
import { fetchLocationById } from '../redux/slices/locationSlice';

const EditLocationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { location, loading, error } = useSelector(state => state.locations || {});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
    best_time_of_day: '',
    best_season: '',
    accessibility: '',
    difficulty_level: '',
    permission_required: false
  });
  
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]);
  const [mapZoom, setMapZoom] = useState(10);
  
  // Загружаем категории при монтировании компонента
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
  
  // Загружаем данные локации при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && id) {
      dispatch(fetchLocationById(id));
    }
  }, [dispatch, id, isAuthenticated]);
  
  // Заполняем форму данными локации, когда они загружены
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        description: location.description || '',
        category_id: location.category_id || '',
        address: location.address || '',
        city: location.city || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        best_time_of_day: location.best_time_of_day || '',
        best_season: location.best_season || '',
        accessibility: location.accessibility || '',
        difficulty_level: location.difficulty_level || '',
        permission_required: location.permission_required || false
      });
      
      if (location.latitude && location.longitude) {
        setMapCenter([location.latitude, location.longitude]);
      }
    }
  }, [location]);
  
  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Перенаправляем пользователей, не являющихся владельцами локации
  useEffect(() => {
    if (isAuthenticated && location && user && location.created_by !== user.id) {
      navigate(`/locations/${id}`);
    }
  }, [isAuthenticated, location, user, id, navigate]);
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Очищаем ошибку для этого поля, если она была
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Обработчик клика на карте
  const handleMapClick = (e) => {
    const coords = e.get('coords');
    setFormData(prev => ({
      ...prev,
      latitude: coords[0],
      longitude: coords[1]
    }));
    setMapCenter(coords);
  };
  
  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Пожалуйста, введите название локации.';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Пожалуйста, введите описание локации.';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'Пожалуйста, выберите категорию.';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Пожалуйста, введите адрес.';
    }
    
    if (!formData.latitude || !formData.longitude) {
      errors.location = 'Пожалуйста, выберите местоположение на карте.';
    }
    
    if (!formData.accessibility) {
      errors.accessibility = 'Пожалуйста, выберите способ добраться до места.';
    }
    
    if (!formData.difficulty_level) {
      errors.difficulty_level = 'Пожалуйста, выберите уровень сложности.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await api.put(`/locations/${id}`, formData);
      navigate(`/locations/${id}`);
    } catch (error) {
      console.error('Ошибка при обновлении локации:', error);
      setSubmitError('Произошла ошибка при обновлении локации. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик кнопки "Назад"
  const handleBack = () => {
    navigate(`/locations/${id}`);
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
          Ошибка при загрузке данных локации: {error}
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Назад
        </Button>
      </Container>
    );
  }
  
  // Если данные локации не найдены
  if (!location) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Не удалось загрузить данные локации
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Назад
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Редактирование локации</h1>
      
      {submitError && (
        <Alert variant="danger" className="mb-4">
          {submitError}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите название локации"
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Введите описание локации"
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                isInvalid={!!formErrors.category_id}
                title="Выберите категорию, к которой относится место"
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.category_id}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Адрес</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Введите адрес"
                isInvalid={!!formErrors.address}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Город</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Введите город"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Лучшее время суток</Form.Label>
                  <Form.Select
                    name="best_time_of_day"
                    value={formData.best_time_of_day}
                    onChange={handleChange}
                    title="Выберите лучшее время суток для посещения"
                  >
                    <option value="">Выберите время суток</option>
                    <option value="morning">Утро</option>
                    <option value="afternoon">День</option>
                    <option value="evening">Вечер</option>
                    <option value="night">Ночь</option>
                    <option value="any">Любое</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Лучший сезон</Form.Label>
                  <Form.Select
                    name="best_season"
                    value={formData.best_season}
                    onChange={handleChange}
                    title="Выберите лучший сезон для посещения"
                  >
                    <option value="">Выберите сезон</option>
                    <option value="spring">Весна</option>
                    <option value="summer">Лето</option>
                    <option value="autumn">Осень</option>
                    <option value="winter">Зима</option>
                    <option value="any">Любой</option>
                  </Form.Select>
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
                    isInvalid={!!formErrors.accessibility}
                    title="Выберите способ добраться до места"
                  >
                    <option value="">Выберите доступность</option>
                    <option value="car">На машине</option>
                    <option value="public_transport">На общественном транспорте</option>
                    <option value="walking">Пешком</option>
                    <option value="hiking">Треккинг</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.accessibility}
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
                    isInvalid={!!formErrors.difficulty_level}
                    title="Выберите уровень сложности доступа к месту"
                  >
                    <option value="">Выберите уровень сложности</option>
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                    <option value="extreme">Экстремальный</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.difficulty_level}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Требуется разрешение для посещения"
                name="permission_required"
                checked={formData.permission_required}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaMapMarkerAlt /> Местоположение на карте
              </Form.Label>
              <div className="mb-2">
                Кликните на карте, чтобы выбрать местоположение
              </div>
              
              {formErrors.location && (
                <Alert variant="danger" className="mb-2">
                  {formErrors.location}
                </Alert>
              )}
              
              <YMaps>
                <div className="map-container" style={{ height: '400px' }}>
                  <Map
                    defaultState={{ center: mapCenter, zoom: mapZoom }}
                    width="100%"
                    height="100%"
                    onClick={handleMapClick}
                  >
                    <SearchControl options={{ float: 'right' }} />
                    {formData.latitude && formData.longitude && (
                      <Placemark geometry={[formData.latitude, formData.longitude]} />
                    )}
                  </Map>
                </div>
              </YMaps>
              
              {formData.latitude && formData.longitude && (
                <div className="mt-2">
                  <small>
                    Координаты: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </small>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={handleBack}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditLocationPage;
