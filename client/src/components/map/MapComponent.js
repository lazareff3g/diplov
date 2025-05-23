// src/components/map/MapComponent.js
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { Alert } from 'react-bootstrap';

const MapComponent = ({ locations = [], loading = false, onLocationSelect = () => {} }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [error, setError] = useState(null);

  // Настройки карты
  const mapState = {
    center: [55.751244, 37.618423], // Москва
    zoom: 10
  };

  // Обработчик загрузки карты
  const handleMapLoad = (mapRef) => {
    setMapInstance(mapRef);
    
    // Обновляем размер карты после загрузки
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }, 500);
  };

  // Обновляем центр карты, если есть локации
  useEffect(() => {
    if (mapInstance && locations && locations.length > 0) {
      try {
        const firstLocation = locations[0];
        if (firstLocation.latitude && firstLocation.longitude) {
          mapInstance.setCenter([firstLocation.latitude, firstLocation.longitude], 10, {
            duration: 500
          });
        }
      } catch (err) {
        console.error('Ошибка при центрировании карты:', err);
        setError('Не удалось центрировать карту');
      }
    }
  }, [mapInstance, locations]);

  if (loading) {
    return <div className="text-center p-5">Загрузка карты...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      backgroundColor: '#f8f9fa'
    }}>
      <YMaps>
        <Map
          defaultState={mapState}
          style={{ width: '100%', height: '100%' }}
          modules={['geocode', 'geoObject.addon.balloon']}
          onLoad={handleMapLoad}
          instanceRef={handleMapLoad}
          options={{
            suppressMapOpenBlock: true
          }}
        >
          {locations && locations.map(location => (
            <Placemark
              key={location.id}
              geometry={[location.latitude, location.longitude]}
              properties={{
                balloonContentHeader: location.name,
                balloonContentBody: `
                  <div style="max-width: 300px;">
                    <p>${location.description ? location.description.substring(0, 100) + '...' : ''}</p>
                    <a href="/locations/${location.id}" target="_blank">Подробнее</a>
                  </div>
                `,
                hintContent: location.name
              }}
              options={{
                preset: 'islands#violetIcon'
              }}
              onClick={() => onLocationSelect(location.id)}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
};

export default MapComponent;
