const locationModel = require('../models/locationModel');

exports.getLocations = async (req, res) => {
  try {
    const {
      category_id,
      best_time_of_day,
      best_season,
      accessibility,
      difficulty_level,
      permission_required,
      search,
      page = 1,
      limit = 10
    } = req.query;
    
    // Создаем объект фильтров
    const filters = {};
    
    if (category_id) filters.category_id = category_id;
    if (best_time_of_day) filters.best_time_of_day = best_time_of_day;
    if (best_season) filters.best_season = best_season;
    if (accessibility) filters.accessibility = accessibility;
    if (difficulty_level) filters.difficulty_level = difficulty_level;
    if (permission_required !== undefined) filters.permission_required = permission_required === 'true';
    if (search) filters.search = search;
    
    // Получаем локации с применением фильтров и пагинации
    const result = await locationModel.getLocations(filters, parseInt(page), parseInt(limit));
    
    // Обрабатываем координаты для каждой локации
    if (result.locations) {
      result.locations = result.locations.map(location => ({
        ...location,
        latitude: location.latitude || (location.coordinates ? location.coordinates.coordinates[1] : null),
        longitude: location.longitude || (location.coordinates ? location.coordinates.coordinates[0] : null)
      }));
    }
    
    res.json(result);
  } catch (err) {
    console.error('Ошибка при получении локаций:', err);
    res.status(500).json({ message: 'Ошибка при получении локаций', error: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await locationModel.getLocationById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }
    
    // Обрабатываем координаты для отдельной локации
    const processedLocation = {
      ...location,
      latitude: location.latitude || (location.coordinates ? location.coordinates.coordinates[1] : null),
      longitude: location.longitude || (location.coordinates ? location.coordinates.coordinates[0] : null)
    };
    
    res.json(processedLocation);
  } catch (err) {
    console.error('Ошибка при получении локации:', err);
    res.status(500).json({ message: 'Ошибка при получении локации', error: err.message });
  }
};

// ДОБАВЛЯЕМ: Функция для получения локаций пользователя
exports.getUserLocations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Получение локаций пользователя:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'ID пользователя обязателен' });
    }
    
    const result = await locationModel.getUserLocations(userId, parseInt(page), parseInt(limit));
    
    // Обрабатываем координаты для каждой локации
    if (result.locations) {
      result.locations = result.locations.map(location => ({
        ...location,
        latitude: location.latitude || (location.coordinates ? location.coordinates.coordinates[1] : null),
        longitude: location.longitude || (location.coordinates ? location.coordinates.coordinates[0] : null)
      }));
    }
    
    console.log(`📍 Найдено ${result.locations.length} локаций пользователя`);
    
    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка при получении локаций пользователя:', err);
    res.status(500).json({ 
      message: 'Ошибка при получении локаций пользователя', 
      error: err.message 
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    console.log('📍 Получены данные для создания локации:', req.body);
    console.log('👤 Пользователь:', req.user);
    
    const {
      name,
      description,
      coordinates,
      latitude,
      longitude,
      address,
      category_id,
      best_time_of_day,
      accessibility,
      difficulty_level,
      tags,
      created_by
    } = req.body;
    
    // ИСПРАВЛЕНИЕ: Упрощенная валидация - только name и координаты обязательны
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Название локации обязательно' });
    }
    
    // Проверка координат - принимаем либо coordinates, либо latitude/longitude
    if (!coordinates && (!latitude || !longitude)) {
      return res.status(400).json({ message: 'Необходимо указать координаты' });
    }
    
    // ИСПРАВЛЕНИЕ: Определяем координаты правильно
    let finalLatitude, finalLongitude;
    
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      finalLatitude = coordinates[0];
      finalLongitude = coordinates[1];
    } else if (latitude && longitude) {
      finalLatitude = parseFloat(latitude);
      finalLongitude = parseFloat(longitude);
    } else {
      return res.status(400).json({ message: 'Некорректные координаты' });
    }
    
    // ИСПРАВЛЕНИЕ: Создание локации с правильными именами полей
    const locationData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      latitude: finalLatitude,
      longitude: finalLongitude,
      address: address || `${finalLatitude.toFixed(6)}, ${finalLongitude.toFixed(6)}`,
      category_id: parseInt(category_id) || 1,
      best_time_of_day: best_time_of_day || null,
      accessibility: accessibility || null,
      difficulty_level: parseInt(difficulty_level) || 1,
      tags: tags || null,
      permission_required: false,
      created_by: req.user.id
    };
    
    console.log('💾 Сохраняем локацию с данными:', locationData);
    
    const location = await locationModel.createLocation(locationData);
    
    console.log('✅ Локация создана:', location);
    
    // Обрабатываем координаты в ответе
    const processedLocation = {
      ...location,
      latitude: location.latitude || finalLatitude,
      longitude: location.longitude || finalLongitude
    };
    
    res.status(201).json({
      message: 'Локация успешно создана',
      location: processedLocation
    });
    
  } catch (err) {
    console.error('❌ Ошибка при создании локации:', err);
    res.status(500).json({ 
      message: 'Ошибка при создании локации', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const location = await locationModel.getLocationById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }
    
    // Проверка прав на редактирование
    if (location.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на редактирование этой локации' });
    }
    
    // Обрабатываем координаты в данных для обновления
    const updateData = { ...req.body };
    if (updateData.latitude && updateData.longitude) {
      updateData.coordinates = { 
        type: 'Point', 
        coordinates: [updateData.longitude, updateData.latitude] 
      };
    }
    
    const updatedLocation = await locationModel.updateLocation(req.params.id, updateData);
    
    // Обрабатываем координаты в ответе
    const processedLocation = {
      ...updatedLocation,
      latitude: updatedLocation.latitude || (updatedLocation.coordinates ? updatedLocation.coordinates.coordinates[1] : null),
      longitude: updatedLocation.longitude || (updatedLocation.coordinates ? updatedLocation.coordinates.coordinates[0] : null)
    };
    
    res.json(processedLocation);
  } catch (err) {
    console.error('Ошибка при обновлении локации:', err);
    res.status(500).json({ message: 'Ошибка при обновлении локации', error: err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await locationModel.getLocationById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }
    
    // Проверка прав на удаление
    if (location.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой локации' });
    }
    
    await locationModel.deleteLocation(req.params.id);
    
    res.json({ message: 'Локация успешно удалена' });
  } catch (err) {
    console.error('Ошибка при удалении локации:', err);
    res.status(500).json({ message: 'Ошибка при удалении локации', error: err.message });
  }
};

// Функция для получения ближайших локаций
exports.getNearbyLocations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    console.log('🔍 Запрос поиска поблизости:', {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius)
    });
    
    if (!latitude || !longitude) {
      console.log('❌ Отсутствуют координаты');
      return res.status(400).json({ message: 'Необходимо указать широту и долготу' });
    }
    
    // Проверяем корректность координат
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);
    
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      console.log('❌ Некорректные координаты:', { lat, lng, rad });
      return res.status(400).json({ message: 'Некорректные координаты' });
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log('❌ Координаты вне допустимого диапазона:', { lat, lng });
      return res.status(400).json({ message: 'Координаты вне допустимого диапазона' });
    }
    
    console.log('✅ Вызываем locationModel.getNearbyLocations...');
    const locations = await locationModel.getNearbyLocations(lat, lng, rad);
    
    console.log(`📍 Получено ${locations.length} локаций из базы данных`);
    
    // Обработка координат для каждой локации
    const processedLocations = locations.map(location => {
      const processed = {
        ...location,
        latitude: location.latitude || (location.coordinates ? location.coordinates.coordinates[1] : null),
        longitude: location.longitude || (location.coordinates ? location.coordinates.coordinates[0] : null),
        distance: (() => {
          if (!location.distance) return '0.00';
          
          const dist = parseFloat(location.distance);
          if (isNaN(dist)) return '0.00';
          
          return dist.toFixed(2);
        })()
      };
      
      console.log(`📌 Локация: ${location.name}, расстояние: ${processed.distance} км`);
      return processed;
    });
    
    console.log(`✅ Отправляем ${processedLocations.length} обработанных локаций`);
    res.json(processedLocations);
    
  } catch (err) {
    console.error('❌ Ошибка при получении ближайших локаций:', err);
    res.status(500).json({ 
      message: 'Ошибка при получении ближайших локаций', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
