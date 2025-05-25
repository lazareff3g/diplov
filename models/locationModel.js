const pool = require('../db');

// Создание новой локации
const createLocation = async (locationData) => {
  try {
    console.log('💾 Создаем локацию в БД:', locationData);
    
    const {
      name, description, latitude, longitude, address, category_id,
      best_time_of_day, best_season, accessibility,
      difficulty_level, permission_required, created_by, tags
    } = locationData;

    console.log('📍 Используем координаты:', { latitude, longitude });

    const query = `
      INSERT INTO locations 
      (name, description, coordinates, address, category_id, best_time_of_day, best_season, 
      accessibility, difficulty_level, permission_required, created_by, tags)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *, ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude
    `;
    
    // ИСПРАВЛЕНИЕ: Правильный порядок - longitude, latitude для PostGIS
    const values = [
      name, 
      description || '', 
      longitude,  // ST_MakePoint принимает (longitude, latitude)
      latitude, 
      address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 
      category_id || 1,
      best_time_of_day || null, 
      best_season || null, 
      accessibility || null,
      difficulty_level || 1, 
      permission_required || false, 
      created_by,
      tags || null
    ];
    
    console.log('🔧 SQL параметры:', values);
    
    const result = await pool.query(query, values);
    console.log('✅ Локация создана в БД:', result.rows[0]);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка создания локации в БД:', error);
    throw error;
  }
};

// ДОБАВЛЯЕМ: Функция для получения локаций пользователя
const getUserLocations = async (userId, page = 1, limit = 10) => {
  try {
    console.log('🔍 Получение локаций пользователя:', { userId, page, limit });
    
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT l.*, 
             ST_X(l.coordinates) as longitude, 
             ST_Y(l.coordinates) as latitude,
             u.username as creator_username, 
             c.name as category_name
      FROM locations l
      LEFT JOIN users u ON l.created_by = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.created_by = $1
      ORDER BY l.created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM locations 
      WHERE created_by = $1
    `;
    
    console.log('🔧 SQL запрос getUserLocations:', { userId, limit, offset });
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    console.log(`✅ Найдено ${result.rows.length} локаций пользователя из ${total} общих`);
    
    return {
      locations: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ Ошибка получения локаций пользователя:', error);
    throw error;
  }
};

// Получение всех локаций с фильтрацией и пагинацией
const getLocations = async (filters = {}, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT l.*, 
             ST_X(l.coordinates) as longitude, 
             ST_Y(l.coordinates) as latitude,
             u.username as creator_username, 
             c.name as category_name
      FROM locations l
      LEFT JOIN users u ON l.created_by = u.id
      LEFT JOIN categories c ON l.category_id = c.id
    `;
    
    const values = [];
    const conditions = [];
    
    if (filters.category_id) {
      values.push(filters.category_id);
      conditions.push(`l.category_id = $${values.length}`);
    }
    
    if (filters.best_time_of_day) {
      values.push(filters.best_time_of_day);
      conditions.push(`l.best_time_of_day = $${values.length}`);
    }
    
    if (filters.best_season) {
      values.push(filters.best_season);
      conditions.push(`l.best_season = $${values.length}`);
    }
    
    if (filters.accessibility) {
      values.push(filters.accessibility);
      conditions.push(`l.accessibility = $${values.length}`);
    }
    
    if (filters.difficulty_level) {
      values.push(filters.difficulty_level);
      conditions.push(`l.difficulty_level = $${values.length}`);
    }
    
    // Добавляем поиск по названию или описанию
    if (filters.search) {
      values.push(`%${filters.search}%`, `%${filters.search}%`);
      conditions.push(`(l.name ILIKE $${values.length - 1} OR l.description ILIKE $${values.length})`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Добавляем подсчет общего количества записей
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);
    
    // Добавляем сортировку и пагинацию
    query += ` ORDER BY l.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    
    return {
      locations: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Ошибка получения локаций:', error);
    throw error;
  }
};

// Получение локации по ID
const getLocationById = async (id) => {
  try {
    const query = `
      SELECT l.*, 
             ST_X(l.coordinates) as longitude, 
             ST_Y(l.coordinates) as latitude,
             u.username as creator_username, 
             c.name as category_name
      FROM locations l
      LEFT JOIN users u ON l.created_by = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка получения локации по ID:', error);
    throw error;
  }
};

// Обновление локации
const updateLocation = async (id, locationData) => {
  try {
    const {
      name, description, coordinates, latitude, longitude, address, category_id,
      best_time_of_day, best_season, accessibility,
      difficulty_level, permission_required, tags
    } = locationData;
    
    let query = 'UPDATE locations SET ';
    const values = [];
    const updateFields = [];
    
    if (name) {
      values.push(name);
      updateFields.push(`name = $${values.length}`);
    }
    
    if (description !== undefined) {
      values.push(description);
      updateFields.push(`description = $${values.length}`);
    }
    
    // ИСПРАВЛЕНИЕ: Правильная обработка координат для обновления
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      values.push(coordinates[1], coordinates[0]); // longitude, latitude для PostGIS
      updateFields.push(`coordinates = ST_SetSRID(ST_MakePoint($${values.length-1}, $${values.length}), 4326)`);
    } else if (latitude && longitude) {
      values.push(longitude, latitude);
      updateFields.push(`coordinates = ST_SetSRID(ST_MakePoint($${values.length-1}, $${values.length}), 4326)`);
    }
    
    if (address) {
      values.push(address);
      updateFields.push(`address = $${values.length}`);
    }
    
    if (category_id) {
      values.push(category_id);
      updateFields.push(`category_id = $${values.length}`);
    }
    
    if (best_time_of_day) {
      values.push(best_time_of_day);
      updateFields.push(`best_time_of_day = $${values.length}`);
    }
    
    if (best_season) {
      values.push(best_season);
      updateFields.push(`best_season = $${values.length}`);
    }
    
    if (accessibility) {
      values.push(accessibility);
      updateFields.push(`accessibility = $${values.length}`);
    }
    
    if (difficulty_level) {
      values.push(difficulty_level);
      updateFields.push(`difficulty_level = $${values.length}`);
    }
    
    if (permission_required !== undefined) {
      values.push(permission_required);
      updateFields.push(`permission_required = $${values.length}`);
    }
    
    if (tags !== undefined) {
      values.push(tags);
      updateFields.push(`tags = $${values.length}`);
    }
    
    if (updateFields.length === 0) {
      return await getLocationById(id);
    }
    
    // Добавляем updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    query += updateFields.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *, ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude';
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка обновления локации:', error);
    throw error;
  }
};

// Удаление локации
const deleteLocation = async (id) => {
  try {
    const query = 'DELETE FROM locations WHERE id = $1';
    await pool.query(query, [id]);
    return { success: true };
  } catch (error) {
    console.error('Ошибка удаления локации:', error);
    throw error;
  }
};

// Поиск ближайших локаций
const getNearbyLocations = async (latitude, longitude, radiusInKm = 10) => {
  try {
    console.log('🔍 Поиск локаций поблизости:', { latitude, longitude, radiusInKm });
    
    // Преобразуем радиус из км в метры
    const radiusInMeters = radiusInKm * 1000;
    
    const query = `
      SELECT l.*, 
             ST_X(l.coordinates) as longitude, 
             ST_Y(l.coordinates) as latitude,
             u.username as creator_username, 
             c.name as category_name,
             ST_Distance(
               l.coordinates::geography, 
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
             ) / 1000 as distance
      FROM locations l
      LEFT JOIN users u ON l.created_by = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE ST_DWithin(
        l.coordinates::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ORDER BY distance ASC
      LIMIT 50
    `;
    
    // ИСПРАВЛЕНИЕ: Правильный порядок для PostGIS - longitude, latitude
    const values = [longitude, latitude, radiusInMeters];
    console.log('📍 SQL параметры:', values);
    
    const result = await pool.query(query, values);
    console.log(`✅ Найдено локаций: ${result.rows.length}`);
    
    return result.rows;
  } catch (error) {
    console.error('❌ Ошибка в getNearbyLocations:', error);
    throw error;
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  getUserLocations // ДОБАВЛЯЕМ ЭКСПОРТ
};
