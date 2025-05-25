// client/src/pages/LocationsPage.js - ДОБАВЛЯЕМ КАРТУ
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LocationList from '../components/locations/LocationList';
import LocationFilter from '../components/locations/LocationFilter';
import MapComponent from '../components/map/MapComponent';
import Pagination from '../components/common/Pagination';
import { 
  fetchLocations, 
  setFilters, 
  clearFilters, 
  setCurrentPage,
  clearError 
} from '../redux/slices/locationSlice';

const LocationsPage = () => {
  const dispatch = useDispatch();
  const { 
    locations, 
    loading, 
    error, 
    filters, 
    currentPage, 
    totalPages 
  } = useSelector(state => state.locations);
  
  const { isAuthenticated } = useSelector(state => state.auth);
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    handleLoadLocations();
  }, [currentPage, filters]);

  const handleLoadLocations = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };
      
      await dispatch(fetchLocations(params));
    } catch (error) {
      console.error('Ошибка загрузки локаций:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
    dispatch(setCurrentPage(1));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      category_id: '',
      best_time_of_day: '',
      best_season: '',
      accessibility: '',
      difficulty_level: '',
      permission_required: ''
    });
    dispatch(clearFilters());
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>📍 Локации для фотосъемки</h1>
            {isAuthenticated && (
              <Button 
                as={Link} 
                to="/locations/add" 
                variant="primary"
                size="lg"
              >
                ➕ Добавить локацию
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Фильтры */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🔍 Фильтры поиска</h5>
            </Card.Header>
            <Card.Body>
              <LocationFilter
                filters={localFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ошибки */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Ошибка:</strong> {error}
              </div>
              <Button variant="outline-danger" size="sm" onClick={() => dispatch(clearError())}>
                Закрыть
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Вкладки: Список / Карта */}
      <Row>
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="list" title="📋 Список">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                  <p className="mt-3">Загрузка локаций...</p>
                </div>
              ) : locations.length > 0 ? (
                <>
                  <LocationList locations={locations} />
                  
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Card className="text-center py-5">
                  <Card.Body>
                    <h3>📭 Локации не найдены</h3>
                    <p className="text-muted">
                      {Object.values(filters).some(filter => filter) 
                        ? 'Попробуйте изменить критерии поиска'
                        : 'Пока что локации не добавлены'
                      }
                    </p>
                    {isAuthenticated && (
                      <Button as={Link} to="/locations/add" variant="primary">
                        Добавить первую локацию
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Tab>
            
            <Tab eventKey="map" title="🗺️ Карта">
              <div style={{ height: '600px', width: '100%' }}>
                <MapComponent
                  center={[55.751244, 37.618423]}
                  zoom={10}
                  height="600px"
                  locations={locations}
                  interactive={false}
                />
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default LocationsPage;
