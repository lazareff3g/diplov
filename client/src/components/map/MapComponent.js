// client/src/components/map/MapComponent.js

import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ 
  center = [55.751244, 37.618423],
  zoom = 10,
  height = '400px',
  onLocationSelect,
  selectedLocation,
  interactive = false
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [placemark, setPlacemark] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    // Загружаем Yandex Maps API напрямую
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!window.ymaps) return;
    window.ymaps.ready(() => {
      const mapInstance = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'geolocationControl']
      });

      // Добавляем поиск
      if (interactive) {
        const searchControl = new window.ymaps.control.SearchControl({
          options: {
            float: 'left',
            placeholderContent: 'Поиск мест...'
          }
        });
        mapInstance.controls.add(searchControl);

        // Обработчик клика по карте
        mapInstance.events.add('click', (e) => {
          const coords = e.get('coords');
          if (onLocationSelect) {
            window.ymaps.geocode(coords).then((res) => {
              const firstGeoObject = res.geoObjects.get(0);
              const address = firstGeoObject ? firstGeoObject.getAddressLine() : '';
              onLocationSelect({
                coordinates: coords,
                address: address || `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                name: 'Выбранная точка'
              });
            }).catch(() => {
              onLocationSelect({
                coordinates: coords,
                address: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                name: 'Выбранная точка'
              });
            });
          }
        });
      }

      setMap(mapInstance);
    });
  };

  // Обновляем метку при изменении selectedLocation
  useEffect(() => {
    if (map && selectedLocation?.coordinates) {
      // Удаляем старую метку
      if (placemark) {
        map.geoObjects.remove(placemark);
      }

      // Добавляем новую метку
      const newPlacemark = new window.ymaps.Placemark(
        selectedLocation.coordinates,
        {
          balloonContent: `<strong>${selectedLocation.name}</strong><br/>${selectedLocation.address}`,
          iconCaption: selectedLocation.name
        },
        {
          preset: 'islands#redDotIconWithCaption',
          draggable: interactive
        }
      );

      map.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);
      map.setCenter(selectedLocation.coordinates, Math.max(zoom, 15));
    }
  }, [map, selectedLocation, interactive, zoom]);

  const handleSearch = () => {
    if (!searchValue.trim() || !map) return;

    window.ymaps.geocode(searchValue).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        const address = firstGeoObject.getAddressLine();
        map.setCenter(coords, 15);
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: coords,
            address: address,
            name: searchValue
          });
        }
        setSearchValue('');
      } else {
        alert('Адрес не найден');
      }
    }).catch(() => {
      alert('Ошибка поиска');
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Поисковая строка */}
      {interactive && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Введите адрес для поиска..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={!searchValue.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: searchValue.trim() ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: searchValue.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            🔍 Найти
          </button>
        </div>
      )}

      {/* Контейнер карты */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: height,
          borderRadius: '8px'
        }} 
      />
      
      {/* Подсказка */}
      {interactive && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          💡 Используйте поиск выше или кликните по карте для выбора места
        </div>
      )}
    </div>
  );
};

export default MapComponent;
