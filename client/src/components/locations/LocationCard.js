import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LocationCard = ({ location }) => {
  return (
    <Card className="h-100">
      {location.image_url && (
        <Card.Img 
          variant="top" 
          src={location.image_url} 
          alt={location.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body>
        <Card.Title>{location.name}</Card.Title>
        <Card.Text>
          {location.description && location.description.length > 100
            ? `${location.description.substring(0, 100)}...`
            : location.description}
        </Card.Text>
      </Card.Body>
      <Card.Footer className="bg-white">
        <Button 
          as={Link} 
          to={`/locations/${location.id}`} 
          variant="primary"
          className="w-100"
        >
          Подробнее
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default LocationCard;
