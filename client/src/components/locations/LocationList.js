import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import LocationCard from './LocationCard';

const LocationList = ({ locations, loading, error }) => {
  if (loading) {
    return <div className="text-center p-5">Загрузка локаций...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!locations || locations.length === 0) {
    return <Alert variant="info">Локации не найдены. Попробуйте изменить параметры поиска.</Alert>;
  }

  return (
    <Row>
      {locations.map(location => (
        <Col key={location.id} md={6} lg={4} className="mb-4">
          <LocationCard location={location} />
        </Col>
      ))}
    </Row>
  );
};

export default LocationList;
