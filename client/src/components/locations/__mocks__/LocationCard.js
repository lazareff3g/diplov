import React from 'react';

const LocationCard = ({ location }) => {
  return (
    <div data-testid="location-card">
      <h3>{location.name}</h3>
      <p>{location.description}</p>
      <p>{location.category_name}</p>
      <p>{location.address}</p>
    </div>
  );
};

export default LocationCard;
