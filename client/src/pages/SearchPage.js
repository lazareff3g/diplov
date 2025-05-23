// src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../redux/slices/locationSlice';
import locationService from '../services/locationService';
import LocationList from '../components/locations/LocationList';

const SearchPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const filters = useSelector(state => state.locations.filters);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlFilters = {
      search: queryParams.get('search') || '',
      category_id: queryParams.get('category_id') || '',
      best_time_of_day: queryParams.get('best_time_of_day') || '',
      best_season: queryParams.get('best_season') || '',
      accessibility: queryParams.get('accessibility') || '',
      difficulty_level: queryParams.get('difficulty_level') || '',
      permission_required: queryParams.get('permission_required') || ''
    };
    
    dispatch(setFilters(urlFilters));
    
    const fetchCategories = async () => {
      try {
        const data = await locationService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };
    
    fetchCategories();
  }, [dispatch, location.search]);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        params.append('page', currentPage);
        
        navigate(`/search?${params.toString()}`, { replace: true });
        
        const response = await locationService.searchLocations(params);
        setLocations(response.locations || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Ошибка при поиске локаций:', err);
        setError('Не удалось загрузить локации');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, [filters, currentPage, navigate]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ ...filters, [name]: value }));
    setCurrentPage(1);
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setCurrentPage(1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Поиск локаций</h1>
      
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-2">
          <Col xs={12} md={8}>
            <Form.Control
              type="text"
              placeholder="Поиск локаций..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              data-testid="search-input"
            />
          </Col>
          <Col xs={6} md={2}>
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              data-testid="search-button"
            >
              🔍 Искать
            </Button>
          </Col>
          <Col xs={6} md={2}>
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="toggle-filters-button"
            >
              {showFilters ? '✖️ Скрыть' : '🔧 Фильтры'}
            </Button>
          </Col>
        </Row>
        
        {showFilters && (
          <Card className="mt-3" data-testid="filters-panel">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Категория</Form.Label>
                    <Form.Select 
                      name="category_id" 
                      value={filters.category_id} 
                      onChange={handleFilterChange}
                      data-testid="category-filter"
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
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Лучшее время суток</Form.Label>
                    <Form.Select 
                      name="best_time_of_day" 
                      value={filters.best_time_of_day} 
                      onChange={handleFilterChange}
                      data-testid="time-of-day-filter"
                    >
                      <option value="">Любое время</option>
                      <option value="morning">Утро</option>
                      <option value="afternoon">День</option>
                      <option value="evening">Вечер</option>
                      <option value="night">Ночь</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Лучший сезон</Form.Label>
                    <Form.Select 
                      name="best_season" 
                      value={filters.best_season} 
                      onChange={handleFilterChange}
                      data-testid="season-filter"
                    >
                      <option value="">Любой сезон</option>
                      <option value="spring">Весна</option>
                      <option value="summer">Лето</option>
                      <option value="autumn">Осень</option>
                      <option value="winter">Зима</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Доступность</Form.Label>
                    <Form.Select 
                      name="accessibility" 
                      value={filters.accessibility} 
                      onChange={handleFilterChange}
                      data-testid="accessibility-filter"
                    >
                      <option value="">Любая</option>
                      <option value="public_transport">Общественный транспорт</option>
                      <option value="car">На машине</option>
                      <option value="walking">Пешком</option>
                      <option value="mixed">Смешанный</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Сложность</Form.Label>
                    <Form.Select 
                      name="difficulty_level" 
                      value={filters.difficulty_level} 
                      onChange={handleFilterChange}
                      data-testid="difficulty-filter"
                    >
                      <option value="">Любая</option>
                      <option value="easy">Легкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group>
                    <Form.Label>Требуется разрешение</Form.Label>
                    <Form.Select 
                      name="permission_required" 
                      value={filters.permission_required} 
                      onChange={handleFilterChange}
                      data-testid="permission-filter"
                    >
                      <option value="">Все</option>
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Button 
                    variant="outline-danger" 
                    onClick={handleClearFilters}
                    data-testid="clear-filters-button"
                  >
                    Сбросить фильтры
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Form>
      
      {loading ? (
        <div className="text-center py-5" data-testid="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
          <p className="mt-3 text-muted">Поиск локаций...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" data-testid="error-message">
          <Alert.Heading>Ошибка!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : locations.length === 0 ? (
        <Alert variant="info" data-testid="no-results-message">
          <Alert.Heading>Локации не найдены</Alert.Heading>
          <p>Попробуйте изменить параметры поиска или использовать другие ключевые слова.</p>
          <hr />
          <p className="mb-0">
            💡 <strong>Подсказка:</strong> Начните с широкого поиска без фильтров или попробуйте другие ключевые слова.
          </p>
        </Alert>
      ) : (
        <div data-testid="search-results">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted mb-0">
              Найдено локаций: <strong>{locations.length}</strong>
            </p>
            <small className="text-muted">
              Страница {currentPage} из {totalPages}
            </small>
          </div>
          
          <LocationList 
            locations={locations} 
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
