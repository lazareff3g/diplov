// routes/locationRoutes.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С PUT МАРШРУТОМ
const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  getUserLocations
} = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

// ВАЖНО: Специфичные маршруты должны быть ПЕРЕД общими
router.get('/nearby', getNearbyLocations);
router.get('/user/:userId', getUserLocations);

// Публичные маршруты
router.get('/', getLocations);
router.get('/:id', getLocationById);

// Защищенные маршруты (требуют аутентификации)
router.post('/', protect, createLocation);
router.put('/:id', protect, updateLocation);
router.delete('/:id', protect, deleteLocation);

// ДОБАВЛЕНИЕ: Прямой PUT маршрут с полной логикой (если контроллер не работает)
router.put('/:id', protect, async (req, res) => {
  try {
    const locationId = req.params.id;
    const userId = req.user.id;
    
    console.log('🔄 Обновление локации:', locationId);
    console.log('👤 Пользователь:', userId);
    console.log('📝 Данные для обновления:', req.body);
    
    const { 
      name, 
      description, 
      coordinates, 
      address, 
      category_id, 
      accessibility, 
      best_time_of_day, 
      difficulty_level, 
      tags 
    } = req.body;
    
    // Валидация
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Название локации обязательно'
      });
    }
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Координаты должны быть массивом из двух чисел'
      });
    }
    
    const { pool } = require('../db');
    
    // ИСПРАВЛЕНИЕ: Проверяем что локация существует и принадлежит пользователю
    const checkQuery = `
      SELECT id, created_by 
      FROM locations 
      WHERE id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [locationId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Локация не найдена'
      });
    }
    
    const location = checkResult.rows[0];
    
    // Проверяем права доступа
    if (location.created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для редактирования этой локации'
      });
    }
    
    // ИСПРАВЛЕНИЕ: Обновляем локацию с правильными полями
    const updateQuery = `
      UPDATE locations 
      SET 
        name = $1,
        description = $2,
        coordinates = ST_SetSRID(ST_MakePoint($3, $4), 4326),
        address = $5,
        category_id = $6,
        accessibility = $7,
        best_time_of_day = $8,
        difficulty_level = $9,
        tags = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING 
        id, 
        name, 
        description, 
        ST_X(coordinates) as longitude,
        ST_Y(coordinates) as latitude,
        address,
        category_id,
        accessibility,
        best_time_of_day,
        difficulty_level,
        tags,
        created_by,
        created_at,
        updated_at
    `;
    
    const updateResult = await pool.query(updateQuery, [
      name.trim(),
      description?.trim() || null,
      coordinates[1], // longitude
      coordinates[0], // latitude
      address || null,
      category_id || null,
      accessibility || null,
      best_time_of_day || null,
      difficulty_level || 1,
      tags || null,
      locationId
    ]);
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении локации'
      });
    }
    
    const updatedLocation = updateResult.rows[0];
    
    console.log('✅ Локация успешно обновлена:', updatedLocation);
    
    res.json({
      success: true,
      message: 'Локация успешно обновлена',
      location: updatedLocation
    });
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении локации:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

module.exports = router;
