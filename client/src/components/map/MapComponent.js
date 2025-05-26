// client/src/components/map/MapComponent.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  const [isMapReady, setIsMapReady] = useState(false);

  const handleLocationSelect = useCallback((locationData) => {
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapRef.current || isMapReady) return;

    const initMap = () => {
      if (!window.ymaps) {
        const script = document.createElement('script');
        
        // ИСПРАВЛЕНИЕ: Проверяем наличие API ключа
        const apiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY;
        
        if (!apiKey) {
          console.error('❌ REACT_APP_YANDEX_MAPS_API_KEY не найден в переменных окружения!');
          return;
        }
        
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        
        console.log('🗺️ Loading Yandex Maps with API key:', apiKey.substring(0, 10) + '...');
        
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
          
          // ИСПРАВЛЕНИЕ: Создаем SearchControl с правильными настройками
          const searchControl = new window.ymaps.control.SearchControl({
            options: {
              // Согласно поисковым результатам, используем yandex#search для поиска организаций
              provider: 'yandex#search',
              placeholderContent: 'Поиск мест и организаций...',
              maxWidth: [200, 400],
              noPlacemark: false,
              resultsPerPage: 5
            }
          });
          
          mapInstance.controls.add(searchControl);
          console.log('🔍 Search control added with provider: yandex#search');

          // ИСПРАВЛЕНИЕ: Правильная обработка событий поиска согласно документации
          searchControl.events.add('resultselect', (e) => {
            try {
              console.log('🎯 Search result selected');
              const index = e.get('index');
              
              searchControl.getResult(index).then((result) => {
                const coords = result.geometry.getCoordinates();
                const address = result.getAddressLine();
                const name = result.properties.get('name') || 
                            result.getLocalities().join(', ') || 
                            'Найденное место';
                
                console.log('📍 Search result data:', { coords, address, name });
                
                handleLocationSelect({
                  coordinates: coords,
                  address: address,
                  name: name
                });
              }).catch((error) => {
                console.error('❌ Ошибка получения результата поиска:', error);
              });
            } catch (error) {
              console.error('❌ Ошибка обработки результата поиска:', error);
            }
          });

          // ИСПРАВЛЕНИЕ: Обработка ошибок поиска
          searchControl.events.add('error', (e) => {
            console.error('❌ Search error:', e);
          });

          // Обработчик клика по карте
          mapInstance.events.add('click', (e) => {
            console.log('👆 Map clicked');
            const coords = e.get('coords');
            console.log('📍 Click coordinates:', coords);
            
            handleLocationSelect({
              coordinates: coords,
              address: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
              name: 'Выбранная точка'
            });
          });
        }

        setMap(mapInstance);
        setIsMapReady(true);
        console.log('✅ Map created successfully');
      } catch (error) {
        console.error('❌ Ошибка создания карты:', error);
      }
    };

    initMap();

    return () => {
      if (map && !isMapReady) {
        console.log('🧹 Destroying map...');
        map.destroy();
      }
    };
  }, []); // ИСПРАВЛЕНИЕ: Пустой массив зависимостей для предотвращения пересоздания

  useEffect(() => {
    if (map && selectedLocation?.coordinates && isMapReady) {
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
          draggable: false
        }
      );

      map.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);
      map.setCenter(selectedLocation.coordinates, Math.max(zoom, 15));
      
      console.log('✅ Placemark updated');
    }
  }, [map, selectedLocation, isMapReady, zoom]);

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
          💡 Используйте поиск на карте для поиска мест и организаций, или кликните по карте
        </div>
      )}
    </div>
  );
};

export default MapComponent;
