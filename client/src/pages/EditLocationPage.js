// client/src/pages/EditLocationPage.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapComponent from '../components/map/MapComponent';

const EditLocationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загрузка данных локации
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/locations/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const location = data.location || data;
          
          console.log('📍 Загруженная локация:', location);
          
          setFormData({
            name: location.name || '',
            description: location.description || '',
            category_id: location.category_id?.toString() || '',
            coordinates: [location.latitude, location.longitude],
            address: location.address || '',
            accessibility: location.accessibility || '',
            best_time: location.best_time_of_day || '',
            difficulty: location.difficulty_level || 1,
            tags: location.tags || ''
          });
          
          setSelectedLocation({
            coordinates: [location.latitude, location.longitude],
            address: location.address || '',
            name: location.name || ''
          });
        } else {
          throw new Error('Локация не найдена');
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки локации:', err);
        setError('Ошибка загрузки локации');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]);

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

  const handleLocationSelect = (locationData) => {
    console.log('🗺️ Выбрана новая локация:', locationData);
    
    setSelectedLocation(locationData);
    setFormData(prev => ({
      ...prev,
      coordinates: locationData.coordinates,
      address: locationData.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Название локации обязательно');
      }

      if (!formData.coordinates) {
        throw new Error('Выберите локацию на карте');
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        coordinates: formData.coordinates,
        address: formData.address || `${formData.coordinates[0].toFixed(6)}, ${formData.coordinates[1].toFixed(6)}`,
        category_id: parseInt(formData.category_id) || null,
        accessibility: formData.accessibility || null,
        best_time_of_day: formData.best_time || null,
        difficulty_level: parseInt(formData.difficulty) || 1,
        tags: formData.tags || null
      };

      console.log('📤 Отправляем обновленные данные:', updateData);

      const response = await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Локация обновлена:', result);
        setSuccess('Локация успешно обновлена!');
        
        setTimeout(() => {
          navigate(`/locations/${id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления локации');
      }
    } catch (err) {
      console.error('❌ Ошибка обновления:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка данных локации...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-warning text-dark">
              <h2 className="mb-0">✏️ Редактировать локацию</h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <strong>Ошибка:</strong> {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  <strong>Успех:</strong> {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
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
                      />
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
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Расположение на карте *</Form.Label>
                  <div className="border rounded p-2" style={{ minHeight: '350px' }}>
                    <MapComponent
                      center={formData.coordinates || [55.751244, 37.618423]}
                      zoom={12}
                      height="320px"
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      interactive={true}
                    />
                  </div>
                  {selectedLocation && (
                    <div className="mt-2">
                      <small className="text-success">
                        ✅ Текущее расположение: {selectedLocation.address}
                      </small>
                    </div>
                  )}
                </Form.Group>

                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/locations/${id}`)}
                    disabled={updating}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={updating}
                    size="lg"
                  >
                    {updating ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Сохранение...
                      </>
                    ) : (
                      '💾 Сохранить изменения'
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

export default EditLocationPage;
