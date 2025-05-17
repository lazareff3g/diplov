import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LocationFilter from '../components/locations/LocationFilter';
import LocationList from '../components/locations/LocationList';
import MapComponent from '../components/map/MapComponent';
import { getLocationsStart, getLocationsSuccess, getLocationsFailure, setFilters } from '../redux/slices/locationSlice';
import api from '../services/api';

const LocationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { locations, loading, error, filters } = useSelector(state => state.locations);
  const [activeTab, setActiveTab] = useState('list');

  // Обработка параметров URL при загрузке страницы
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      dispatch(setFilters({ category_id: category }));
    }
  }, [searchParams, dispatch]);

  // Загрузка локаций при изменении фильтров
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        dispatch(getLocationsStart());
        
        // Формирование параметров запроса из фильтров
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
        
        const response = await api.get(`/locations?${params.toString()}`);
        dispatch(getLocationsSuccess(response.data));
      } catch (err) {
        console.error('Ошибка при загрузке локаций:', err);
        const errorMessage = err.response?.data?.message || 'Ошибка при загрузке локаций';
        dispatch(getLocationsFailure(errorMessage));
      }
    };

    fetchLocations();
  }, [filters, dispatch]);

  const handleLocationSelect = (id) => {
    // Используем navigate вместо window.location для навигации внутри React Router
    navigate(`/locations/${id}`);
  };

  return (
    <Container>
      <h1 className="mb-4">Локации для фотосессий</h1>
      
      <LocationFilter />
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="list" title="Список">
          <LocationList
            locations={locations}
            loading={loading}
            error={error}
          />
        </Tab>
        <Tab eventKey="map" title="Карта">
          <div style={{ height: '600px', width: '100%' }} className="mb-4">
            <MapComponent
              locations={locations}
              loading={loading}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default LocationsPage;
