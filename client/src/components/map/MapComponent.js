// client/src/components/map/MapComponent.js - С ОТЛАДКОЙ
import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ 
  center = [55.751244, 37.618423],
  zoom = 10,
  height = '400px',
  onLocationSelect,
  selectedLocation,
  interactive = false
}) => {
  // 🔍 ДОБАВЛЕНА ОТЛАДКА API КЛЮЧЕЙ:
  console.log('🔍 DEBUGGING API KEYS:');
  console.log('Maps API Key:', process.env.REACT_APP_YANDEX_MAPS_API_KEY);
  console.log('Suggest API Key:', process.env.REACT_APP_YANDEX_SUGGEST_API_KEY);
  console.log('API URL:', process.env.REACT_APP_API_URL);
  console.log('All env vars:', process.env);

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [placemark, setPlacemark] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.ymaps) {
        const script = document.createElement('script');
        // УПРОЩЕНИЕ: Только основной API без suggest
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
        
        // 🔍 ОТЛАДКА URL:
        console.log('🗺️ Loading Yandex Maps with URL:', script.src);
        
        script.onload = () => {
          console.log('✅ Yandex Maps API loaded successfully');
          window.ymaps.ready(createMap);
        };
        script.onerror = () => {
          console.error('❌ Ошибка загрузки Yandex Maps API');
        };
        document.head.appendChild(script);
      } else {
        console.log('♻️ Yandex Maps API already loaded');
        window.ymaps.ready(createMap);
      }
    };

    const createMap = () => {
      try {
        console.log('🏗️ Creating map instance...');
        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'geolocationControl']
        });

        if (interactive) {
          console.log('🔧 Adding interactive features...');
          
          // ТОЛЬКО встроенный поиск Yandex - он работает без дополнительных API
          const searchControl = new window.ymaps.control.SearchControl({
            options: {
              float: 'left',
              placeholderContent: 'Поиск мест...',
              maxWidth: [200, 300],
              noPlacemark: false
            }
          });
          
          mapInstance.controls.add(searchControl);
          console.log('🔍 Search control added');

          // Обработчик результатов встроенного поиска
          searchControl.events.add('resultselect', (e) => {
            console.log('🎯 Search result selected');
            const index = e.get('index');
            searchControl.getResult(index).then((result) => {
              const coords = result.geometry.getCoordinates();
              const address = result.getAddressLine();
              const name = result.getLocalities().join(', ') || 'Найденное место';
              
              console.log('📍 Search result:', { coords, address, name });
              
              if (onLocationSelect) {
                onLocationSelect({
                  coordinates: coords,
                  address: address,
                  name: name
                });
              }
            }).catch((error) => {
              console.error('❌ Ошибка получения результата поиска:', error);
            });
          });

          // Обработчик клика по карте
          mapInstance.events.add('click', (e) => {
            console.log('👆 Map clicked');
            const coords = e.get('coords');
            console.log('📍 Click coordinates:', coords);
            
            if (onLocationSelect) {
              // Простое геокодирование
              window.ymaps.geocode(coords).then((res) => {
                console.log('🔄 Geocoding result:', res);
                const firstGeoObject = res.geoObjects.get(0);
                const address = firstGeoObject ? firstGeoObject.getAddressLine() : '';
                
                const locationData = {
                  coordinates: coords,
                  address: address || `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                  name: 'Выбранная точка'
                };
                
                console.log('📍 Location selected:', locationData);
                onLocationSelect(locationData);
              }).catch((error) => {
                console.error('❌ Geocoding error:', error);
                const locationData = {
                  coordinates: coords,
                  address: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                  name: 'Выбранная точка'
                };
                onLocationSelect(locationData);
              });
            }
          });
        }

        setMap(mapInstance);
        console.log('✅ Map created successfully');
      } catch (error) {
        console.error('❌ Ошибка создания карты:', error);
      }
    };

    initMap();

    return () => {
      if (map) {
        console.log('🧹 Destroying map...');
        map.destroy();
      }
    };
  }, [center, zoom, interactive, onLocationSelect]);

  // Обновляем метку при изменении selectedLocation
  useEffect(() => {
    if (map && selectedLocation?.coordinates) {
      console.log('📍 Updating placemark:', selectedLocation);
      
      if (placemark) {
        map.geoObjects.remove(placemark);
      }

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
      
      console.log('✅ Placemark updated');
    }
  }, [map, selectedLocation, interactive, zoom]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Контейнер карты */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: height,
          borderRadius: '8px',
          backgroundColor: '#f0f0f0'
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
          💡 Используйте встроенный поиск Yandex на карте или кликните по карте
        </div>
      )}
    </div>
  );
};

export default MapComponent;
