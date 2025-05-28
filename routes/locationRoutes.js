// routes/locationRoutes.js - ПОЛНАЯ ВЕРСИЯ С РАСШИРЕННЫМИ ПОЛЯМИ
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// ВАЖНО: Специфичные маршруты должны быть ПЕРЕД общими
// Получение ближайших локаций - ДОБАВЛЕН РОУТ
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    console.log('🔍 Поиск ближайших локаций:', { latitude, longitude, radius });
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Необходимы параметры latitude и longitude'
      });
    }
    
    const { pool } = require('../db');
    
    // ИСПРАВЛЕНИЕ: Используем ST_Distance для поиска ближайших локаций
    const result = await pool.query(`
      SELECT 
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
        -- ДОБАВЛЕНО: расширенные поля
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at,
        ST_Distance(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)
        ) * 111.32 as distance_km
      FROM locations
      WHERE ST_DWithin(
        coordinates,
        ST_SetSRID(ST_MakePoint($2, $1), 4326),
        $3 / 111.32
      )
      ORDER BY distance_km
      LIMIT 50
    `, [latitude, longitude, radius]);
    
    console.log('✅ Найдено ближайших локаций:', result.rows.length);
    
    res.json({
      success: true,
      locations: result.rows,
      searchCenter: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      searchRadius: parseFloat(radius)
    });
  } catch (error) {
    console.error('❌ Ошибка поиска ближайших локаций:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при поиске ближайших локаций',
      error: error.message
    });
  }
});

// Получение локаций пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pool } = require('../db');
    
    console.log('🔍 Поиск локаций пользователя:', userId);
    
    const result = await pool.query(`
      SELECT 
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
        -- ДОБАВЛЕНО: расширенные поля
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at
      FROM locations 
      WHERE created_by = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    console.log('✅ Найдено локаций пользователя:', result.rows.length);
    
    res.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения локаций пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении локаций пользователя',
      error: error.message
    });
  }
});

// Получение всех локаций
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../db');
    
    // ИСПРАВЛЕНИЕ: Добавляем все расширенные поля
    const result = await pool.query(`
      SELECT 
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
        -- ДОБАВЛЕНО: расширенные поля
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at
      FROM locations 
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Найдено локаций:', result.rows.length);
    
    res.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения локаций:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении локаций',
      error: error.message
    });
  }
});

// Получение локации по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = require('../db');
    
    console.log('🔍 Поиск локации с ID:', id);
    
    const result = await pool.query(`
      SELECT 
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
        -- ДОБАВЛЕНО: расширенные поля
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at
      FROM locations 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      console.log('❌ Локация не найдена');
      return res.status(404).json({
        success: false,
        message: 'Локация не найдена'
      });
    }
    
    console.log('✅ Локация найдена:', result.rows[0]);
    
    res.json({
      success: true,
      location: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Ошибка получения локации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении локации',
      error: error.message
    });
  }
});

// Создание новой локации
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      description, 
      coordinates, 
      address, 
      category_id, 
      accessibility, 
      best_time_of_day, 
      difficulty_level, 
      tags,
      // ДОБАВЛЕНО: расширенные поля
      photo_type,
      best_season,
      lighting_type,
      camera_angle,
      transport_type,
      cost_type,
      popularity_level,
      physical_preparation,
      suitable_for,
      equipment_needed,
      parking_available,
      entrance_fee
    } = req.body;
    
    console.log('📝 Создание новой локации для пользователя:', userId);
    console.log('📝 Данные:', req.body);
    
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
    
    const insertQuery = `
      INSERT INTO locations (
        name, description, coordinates, address, category_id, 
        accessibility, best_time_of_day, difficulty_level, tags, created_by,
        photo_type, best_season, lighting_type, camera_angle,
        transport_type, cost_type, popularity_level, physical_preparation,
        suitable_for, equipment_needed, parking_available, entrance_fee
      ) VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING 
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
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at
    `;
    
    const result = await pool.query(insertQuery, [
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
      userId,
      // Расширенные поля
      photo_type || null,
      best_season || null,
      lighting_type || null,
      camera_angle || null,
      transport_type || null,
      cost_type || null,
      popularity_level || null,
      physical_preparation || null,
      suitable_for || null,
      equipment_needed || null,
      parking_available || null,
      entrance_fee || null
    ]);
    
    console.log('✅ Локация создана:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Локация успешно создана',
      location: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания локации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании локации',
      error: error.message
    });
  }
});

// ИСПРАВЛЕНО: Обновление локации с расширенными полями
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
      tags,
      // ДОБАВЛЕНО: расширенные поля
      photo_type,
      best_season,
      lighting_type,
      camera_angle,
      transport_type,
      cost_type,
      popularity_level,
      physical_preparation,
      suitable_for,
      equipment_needed,
      parking_available,
      entrance_fee
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
    
    // Проверяем что локация существует и принадлежит пользователю
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
    if (location.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для редактирования этой локации'
      });
    }
    
    // ИСПРАВЛЕНО: Обновляем локацию с расширенными полями
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
        photo_type = $11,
        best_season = $12,
        lighting_type = $13,
        camera_angle = $14,
        transport_type = $15,
        cost_type = $16,
        popularity_level = $17,
        physical_preparation = $18,
        suitable_for = $19,
        equipment_needed = $20,
        parking_available = $21,
        entrance_fee = $22,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $23
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
        photo_type,
        best_season,
        lighting_type,
        camera_angle,
        transport_type,
        cost_type,
        popularity_level,
        physical_preparation,
        suitable_for,
        equipment_needed,
        parking_available,
        entrance_fee,
        created_by,
        created_at
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
      // Расширенные поля
      photo_type || null,
      best_season || null,
      lighting_type || null,
      camera_angle || null,
      transport_type || null,
      cost_type || null,
      popularity_level || null,
      physical_preparation || null,
      suitable_for || null,
      equipment_needed || null,
      parking_available || null,
      entrance_fee || null,
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
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message
    });
  }
});

// Удаление локации
router.delete('/:id', protect, async (req, res) => {
  try {
    const locationId = req.params.id;
    const userId = req.user.id;
    
    const { pool } = require('../db');
    
    // Проверяем права доступа и удаляем
    const deleteQuery = `
      DELETE FROM locations 
      WHERE id = $1 AND created_by = $2
      RETURNING id, name
    `;
    
    const result = await pool.query(deleteQuery, [locationId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Локация не найдена или нет прав для удаления'
      });
    }
    
    console.log('✅ Локация удалена:', result.rows[0]);
    
    res.json({
      success: true,
      message: 'Локация успешно удалена'
    });
    
  } catch (error) {
    console.error('❌ Ошибка удаления локации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении локации'
    });
  }
});

module.exports = router;
