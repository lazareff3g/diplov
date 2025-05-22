import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { setFilters, clearFilters } from '../../redux/slices/locationSlice';
import api from '../../services/api';

const LocationFilter = () => {
  const dispatch = useDispatch();
  const currentFilters = useSelector(state => state.locations.filters);
  
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    category_id: '',
    best_time_of_day: '',
    best_season: '',
    accessibility: '',
    difficulty_level: '',
    permission_required: '',
    search: ''
  });

  // Загрузка категорий при монтировании компонента
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

  // Установка локальных фильтров из Redux при монтировании или изменении
  useEffect(() => {
    setLocalFilters({
      category_id: currentFilters.category_id || '',
      best_time_of_day: currentFilters.best_time_of_day || '',
      best_season: currentFilters.best_season || '',
      accessibility: currentFilters.accessibility || '',
      difficulty_level: currentFilters.difficulty_level || '',
      permission_required: currentFilters.permission_required || '',
      search: currentFilters.search || ''
    });
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters(localFilters));
  };

  const handleReset = () => {
    setLocalFilters({
      category_id: '',
      best_time_of_day: '',
      best_season: '',
      accessibility: '',
      difficulty_level: '',
      permission_required: '',
      search: ''
    });
    dispatch(clearFilters());
  };

  return (
    <Card className="mb-4">
      <Card.Header>Фильтры</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Поиск</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                name="search"
                placeholder="Поиск по названию или описанию"
                value={localFilters.search}
                onChange={handleChange}
              />
            </InputGroup>
          </Form.Group>
          
          <Row>
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  name="category_id"
                  value={localFilters.category_id}
                  onChange={handleChange}
                >
                  <option value="">Все категории</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Время суток</Form.Label>
                <Form.Select
                  name="best_time_of_day"
                  value={localFilters.best_time_of_day}
                  onChange={handleChange}
                >
                  <option value="">Любое время</option>
                  <option value="morning">Утро</option>
                  <option value="afternoon">День</option>
                  <option value="evening">Вечер</option>
                  <option value="night">Ночь</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Сезон</Form.Label>
                <Form.Select
                  name="best_season"
                  value={localFilters.best_season}
                  onChange={handleChange}
                >
                  <option value="">Любой сезон</option>
                  <option value="spring">Весна</option>
                  <option value="summer">Лето</option>
                  <option value="autumn">Осень</option>
                  <option value="winter">Зима</option>
                  <option value="any">Всесезонно</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Доступность</Form.Label>
                <Form.Select
                  name="accessibility"
                  value={localFilters.accessibility}
                  onChange={handleChange}
                >
                  <option value="">Любая доступность</option>
                  <option value="public_transport">Общественный транспорт</option>
                  <option value="car">Автомобиль</option>
                  <option value="walking">Пешком</option>
                  <option value="mixed">Смешанный</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Сложность</Form.Label>
                <Form.Select
                  name="difficulty_level"
                  value={localFilters.difficulty_level}
                  onChange={handleChange}
                >
                  <option value="">Любая сложность</option>
                  <option value="easy">Легкая</option>
                  <option value="medium">Средняя</option>
                  <option value="hard">Сложная</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Разрешение</Form.Label>
                <Form.Select
                  name="permission_required"
                  value={localFilters.permission_required}
                  onChange={handleChange}
                >
                  <option value="">Все локации</option>
                  <option value="false">Без разрешения</option>
                  <option value="true">Требуется разрешение</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleReset} className="me-2">
              Сбросить
            </Button>
            <Button variant="primary" type="submit">
              Применить
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LocationFilter;
