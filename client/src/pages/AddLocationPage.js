// client/src/pages/AddLocationPage.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapComponent from '../components/map/MapComponent';
import { createLocation } from '../redux/slices/locationSlice';

const AddLocationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    coordinates: null,
    address: '',
    accessibility: '',
    best_time: '',
    difficulty: 1,
    tags: ''
  });
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
        best_time_of_day: formData.best_time || null,
        accessibility: formData.accessibility || null,
        difficulty_level: parseInt(formData.difficulty) || 1,
        tags: formData.tags || null,
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
                      <Form.Label>Категория</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Выберите категорию</option>
                        <option value="1">Природа</option>
                        <option value="2">Архитектура</option>
                        <option value="3">Городской пейзаж</option>
                        <option value="4">Историческое место</option>
                        <option value="5">Парки и сады</option>
                        <option value="6">Водоемы</option>
                        <option value="7">Горы и холмы</option>
                        <option value="8">Другое</option>
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

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Доступность</Form.Label>
                      <Form.Select
                        name="accessibility"
                        value={formData.accessibility}
                        onChange={handleInputChange}
                      >
                        <option value="">Выберите уровень доступности</option>
                        <option value="easy">Легкий доступ</option>
                        <option value="moderate">Средний доступ</option>
                        <option value="difficult">Сложный доступ</option>
                        <option value="expert">Только для экспертов</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Лучшее время для съемки</Form.Label>
                      <Form.Select
                        name="best_time"
                        value={formData.best_time}
                        onChange={handleInputChange}
                      >
                        <option value="">Выберите время</option>
                        <option value="sunrise">Рассвет</option>
                        <option value="morning">Утро</option>
                        <option value="noon">День</option>
                        <option value="afternoon">После полудня</option>
                        <option value="sunset">Закат</option>
                        <option value="night">Ночь</option>
                        <option value="any">Любое время</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Сложность съемки</Form.Label>
                      <Form.Select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                      >
                        <option value="1">1 - Очень легко</option>
                        <option value="2">2 - Легко</option>
                        <option value="3">3 - Средне</option>
                        <option value="4">4 - Сложно</option>
                        <option value="5">5 - Очень сложно</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Теги</Form.Label>
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
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Выберите локацию на карте *</Form.Label>
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
                    disabled={!isFormValid || loading || creating}
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
