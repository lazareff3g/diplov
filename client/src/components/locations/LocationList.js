// src/components/locations/LocationList.js
import React from 'react';
import { Row, Col, Alert, Placeholder, Pagination } from 'react-bootstrap';
import LocationCard from './LocationCard';

const LocationList = ({ locations, loading, error, currentPage, totalPages, onPageChange }) => {
  // Функция для отображения пагинации
  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;
    
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  if (loading) {
    // Создаем заглушки для карточек во время загрузки
    return (
      <Row>
        {[...Array(6)].map((_, index) => (
          <Col key={index} md={6} lg={4} className="mb-4">
            <Placeholder as="div" animation="glow" className="card h-100">
              <Placeholder xs={12} style={{ height: '180px' }} className="card-img-top" />
              <div className="card-body">
                <Placeholder as="h5" animation="glow">
                  <Placeholder xs={8} />
                </Placeholder>
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={4} className="mb-2" />
                </Placeholder>
                <Placeholder as="p" animation="glow">
                  <Placeholder xs={12} />
                  <Placeholder xs={10} />
                  <Placeholder xs={8} />
                </Placeholder>
              </div>
              <div className="card-footer">
                <Placeholder as="div" animation="glow" className="d-flex justify-content-between">
                  <Placeholder xs={5} />
                  <Placeholder xs={3} />
                </Placeholder>
              </div>
            </Placeholder>
          </Col>
        ))}
      </Row>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!locations || locations.length === 0) {
    return <Alert variant="info">Локации не найдены. Попробуйте изменить параметры поиска.</Alert>;
  }

  return (
    <div>
      <Row>
        {locations.map(location => (
          <Col key={location.id} md={6} lg={4} className="mb-4">
            <LocationCard location={location} />
          </Col>
        ))}
      </Row>
      
      {renderPagination()}
    </div>
  );
};

export default LocationList;
