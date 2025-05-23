import React, { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark, Clusterer } from '@pbe/react-yandex-maps';
import axios from 'axios';
import './LocationMap.css';

const LocationMap = ({ locations, onLocationSelect, center, zoom }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Установка начальных координат и масштаба
  const defaultCenter = center || [55.751244, 37.618423]; // Москва по умолчанию
  const defaultZoom = zoom || 10;

  // Получение текущего местоположения пользователя
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
        }
      );
    }
  }, []);

  // Обработчик клика по метке
  const handlePlacemarkClick = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Обработчик инициализации карты
  const handleMapLoad = (ymaps) => {
    if (mapRef.current) {
      setMapInstance(mapRef.current);
    }
  };

  return (
    <div className="location-map" style={{ 
      width: '100%', 
      height: '600px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden' 
    }}>
      <YMaps query={{ apikey: process.env.REACT_APP_YANDEX_MAPS_API_KEY }}>
        <Map
          defaultState={{
            center: defaultCenter,
            zoom: defaultZoom,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
          }}
          style={{ width: '100%', height: '100%' }}
          instanceRef={mapRef}
          onLoad={handleMapLoad}
          modules={['clusterer.addon.balloon']}
          options={{
            suppressMapOpenBlock: true
          }}
        >
          {/* Кластеризация меток */}
          <Clusterer
            options={{
              preset: 'islands#invertedVioletClusterIcons',
              groupByCoordinates: false,
            }}
          >
            {/* Отображение локаций */}
            {locations && locations.map((location) => (
              <Placemark
                key={location.id}
                geometry={[location.latitude, location.longitude]}
                properties={{
                  balloonContentHeader: location.name,
                  balloonContentBody: `
                    <div style="max-width: 300px;">
                      <p>${location.description || ''}</p>
                      <p><strong>Категория:</strong> ${location.category_name || ''}</p>
                    </div>
                  `,
                  balloonContentFooter: `<a href="/locations/${location.id}" target="_blank">Подробнее</a>`,
                  hintContent: location.name
                }}
                options={{
                  preset: 'islands#violetIcon',
                }}
                onClick={() => handlePlacemarkClick(location)}
              />
            ))}
          </Clusterer>

          {/* Отображение текущего местоположения пользователя */}
          {userLocation && (
            <Placemark
              geometry={userLocation}
              properties={{
                hintContent: 'Ваше местоположение'
              }}
              options={{
                preset: 'islands#geolocationIcon',
                iconColor: '#0077ff'
              }}
            />
          )}
        </Map>
      </YMaps>
    </div>
  );
};

export default LocationMap;
