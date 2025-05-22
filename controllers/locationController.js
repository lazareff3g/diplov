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
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении локаций', error: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await locationModel.getLocationById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }
    
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении локации', error: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const {
      name,
      description,
      coordinates,
      address,
      category_id,
      best_time_of_day,
      best_season,
      accessibility,
      difficulty_level,
      permission_required
    } = req.body;
    
    // Проверка наличия обязательных полей
    if (!name || !description || !coordinates || !address || !category_id) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля' });
    }
    
    // Создание локации
    const locationData = {
      name,
      description,
      coordinates,
      address,
      category_id,
      best_time_of_day,
      best_season,
      accessibility,
      difficulty_level,
      permission_required: permission_required || false,
      created_by: req.user.id
    };
    
    const location = await locationModel.createLocation(locationData);
    
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании локации', error: err.message });
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
    
    const updatedLocation = await locationModel.updateLocation(req.params.id, req.body);
    
    res.json(updatedLocation);
  } catch (err) {
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
    res.status(500).json({ message: 'Ошибка при удалении локации', error: err.message });
  }
};

// Новая функция для получения ближайших локаций
exports.getNearbyLocations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Необходимо указать широту и долготу' });
    }
    
    const locations = await locationModel.getNearbyLocations(
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseFloat(radius)
    );
    
    res.json(locations);
  } catch (err) {
    console.error('Ошибка при получении ближайших локаций:', err);
    res.status(500).json({ message: 'Ошибка при получении ближайших локаций', error: err.message });
  }
};
