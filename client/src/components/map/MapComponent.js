// client/src/components/map/MapComponent.js - ПОЛНАЯ ВЕРСИЯ С ПОДДЕРЖКОЙ МНОЖЕСТВЕННЫХ ЛОКАЦИЙ
import React, { useEffect, useRef, useState, useCallback } from 'react';

const MapComponent = ({ 
  center = [55.751244, 37.618423],
  zoom = 10,
  height = '400px',
  onLocationSelect,
  selectedLocation,
  interactive = false,
  // ДОБАВЛЕНО: Поддержка множественных локаций
  locations = [],
  userLocation = null
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [placemark, setPlacemark] = useState(null);
  const [objectManager, setObjectManager] = useState(null);
  const [userPlacemark, setUserPlacemark] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleLocationSelect = useCallback((locationData) => {
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  }, [onLocationSelect]);

  // ДОБАВЛЕНО: Создание GeoJSON для множественных локаций
  const createGeoJSON = useCallback(() => {
    console.log('🔍 Создаем GeoJSON для локаций:', locations.length);
    
    if (!Array.isArray(locations) || locations.length === 0) {
      console.log('⚠️ Нет локаций для отображения');
      return {
        type: "FeatureCollection",
        features: []
      };
    }

    const features = locations.map((location, index) => {
      // ИСПРАВЛЕНО: Правильный порядок координат для Yandex Maps
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      
      console.log(`📍 Локация ${location.name}: lat=${lat}, lng=${lng}`);
      
      // ПРОВЕРКА: Валидные ли координаты
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`❌ Неверные координаты для локации ${location.name}:`, { lat, lng });
        return null;
      }
      
      return {
        type: "Feature",
        id: location.id || index,
        geometry: {
          type: "Point",
          // ИСПРАВЛЕНО: Для Yandex Maps порядок [широта, долгота]
          coordinates: [lat, lng]
        },
        properties: {
          balloonContent: `
            <div style="padding: 10px; max-width: 250px;">
              <h5>${location.name}</h5>
              <p>${location.description || 'Описание не указано'}</p>
              <p><strong>Адрес:</strong> ${location.address || 'Не указан'}</p>
              ${location.distance_km ? `<p><strong>Расстояние:</strong> ${location.distance_km.toFixed(1)} км</p>` : ''}
              <a href="/locations/${location.id}" style="color: #007bff;">Подробнее →</a>
            </div>
          `,
          clusterCaption: location.name,
          hintContent: location.name
        },
        options: {
          preset: 'islands#redDotIcon'
        }
      };
    }).filter(feature => feature !== null); // Убираем null значения

    console.log('✅ Создано features:', features.length);
    
    return {
      type: "FeatureCollection",
      features: features
    };
  }, [locations]);

  // Инициализация карты
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
        
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&coordorder=latlong`;
        
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

        // ДОБАВЛЕНО: Создаем ObjectManager для множественных точек
        const objectManagerInstance = new window.ymaps.ObjectManager({
          clusterize: true,
          gridSize: 64,
          clusterDisableClickZoom: false
        });

        // Добавляем ObjectManager на карту
        mapInstance.geoObjects.add(objectManagerInstance);

        // ДОБАВЛЕНО: Обработчик клика по объекту в ObjectManager
        objectManagerInstance.objects.events.add('click', (e) => {
          const objectId = e.get('objectId');
          const object = objectManagerInstance.objects.getById(objectId);
          
          if (object && handleLocationSelect) {
            console.log('🎯 Clicked on location object:', object);
            handleLocationSelect({
              coordinates: object.geometry.coordinates,
              properties: object.properties
            });
          }
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
        setObjectManager(objectManagerInstance);
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

  // ДОБАВЛЕНО: Обновление множественных точек на карте
  useEffect(() => {
    if (!objectManager || !isMapReady) {
      console.log('⏳ Карта еще не готова для добавления точек');
      return;
    }

    console.log('🔄 Обновляем точки на карте. Локаций:', locations.length);

    // Очищаем старые точки
    objectManager.removeAll();

    if (locations.length === 0) {
      console.log('⚠️ Нет локаций для отображения');
      return;
    }

    // Создаем и добавляем новые точки
    const geoJSON = createGeoJSON();
    
    if (geoJSON.features.length > 0) {
      objectManager.add(geoJSON);
      console.log('✅ Добавлено точек на карту:', geoJSON.features.length);
      
      // Подгоняем карту под все точки
      if (map && geoJSON.features.length > 1) {
        const bounds = objectManager.getBounds();
        if (bounds) {
          map.setBounds(bounds, { 
            checkZoomRange: true,
            zoomMargin: 50
          });
        }
      }
    } else {
      console.log('⚠️ Нет валидных точек для отображения');
    }

  }, [objectManager, locations, isMapReady, map, createGeoJSON]);

  // ДОБАВЛЕНО: Обновление метки пользователя
  useEffect(() => {
    if (!map || !userLocation || !isMapReady) return;

    console.log('👤 Добавляем метку пользователя:', userLocation);

    // Удаляем старую метку пользователя
    if (userPlacemark) {
      map.geoObjects.remove(userPlacemark);
    }

    // Создаем новую метку пользователя
    const newUserPlacemark = new window.ymaps.Placemark(
      [userLocation.latitude, userLocation.longitude],
      {
        balloonContent: 'Ваше местоположение',
        hintContent: 'Вы здесь'
      },
      {
        preset: 'islands#blueCircleDotIcon'
      }
    );

    map.geoObjects.add(newUserPlacemark);
    setUserPlacemark(newUserPlacemark);

    // Очистка при размонтировании
    return () => {
      if (map && newUserPlacemark) {
        map.geoObjects.remove(newUserPlacemark);
      }
    };
  }, [map, userLocation, isMapReady]);

  // Обновление одиночной метки (для AddLocationPage)
  useEffect(() => {
    if (map && selectedLocation?.coordinates && isMapReady && !locations.length) {
      console.log('📍 Updating single placemark:', selectedLocation);
      
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
      
      console.log('✅ Single placemark updated');
    }
  }, [map, selectedLocation, isMapReady, zoom, locations.length]);

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

      {/* ДОБАВЛЕНО: Информация о локациях */}
      {locations.length > 0 && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          📍 Отображено локаций: {locations.length}
          {userLocation && ' | 👤 Ваше местоположение отмечено синим'}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
