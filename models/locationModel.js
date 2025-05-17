const pool = require('../db');

// Создание новой локации
const createLocation = async (locationData) => {
  const {
    name, description, coordinates, address, category_id,
    best_time_of_day, best_season, accessibility,
    difficulty_level, permission_required, created_by
  } = locationData;

  const query = `
    INSERT INTO locations 
    (name, description, coordinates, address, category_id, best_time_of_day, best_season, 
    accessibility, difficulty_level, permission_required, created_by)
    VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *, ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude
  `;
  
  const values = [
    name, description, coordinates[0], coordinates[1], address, category_id,
    best_time_of_day, best_season, accessibility,
    difficulty_level, permission_required, created_by
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение всех локаций с фильтрацией
const getLocations = async (filters = {}) => {
  let query = `
    SELECT l.*, 
           ST_X(l.coordinates) as longitude, 
           ST_Y(l.coordinates) as latitude,
           u.username as creator_username, 
           c.name as category_name
    FROM locations l
    JOIN users u ON l.created_by = u.id
    JOIN categories c ON l.category_id = c.id
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
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  const result = await pool.query(query, values);
  return result.rows;
};

// Получение локации по ID
const getLocationById = async (id) => {
  const query = `
    SELECT l.*, 
           ST_X(l.coordinates) as longitude, 
           ST_Y(l.coordinates) as latitude,
           u.username as creator_username, 
           c.name as category_name
    FROM locations l
    JOIN users u ON l.created_by = u.id
    JOIN categories c ON l.category_id = c.id
    WHERE l.id = $1
  `;
  
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Обновление локации
const updateLocation = async (id, locationData) => {
  const {
    name, description, coordinates, address, category_id,
    best_time_of_day, best_season, accessibility,
    difficulty_level, permission_required
  } = locationData;
  
  let query = 'UPDATE locations SET ';
  const values = [];
  const updateFields = [];
  
  if (name) {
    values.push(name);
    updateFields.push(`name = $${values.length}`);
  }
  
  if (description) {
    values.push(description);
    updateFields.push(`description = $${values.length}`);
  }
  
  if (coordinates) {
    values.push(coordinates[0], coordinates[1]);
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
  
  if (updateFields.length === 0) {
    return await getLocationById(id);
  }
  
  query += updateFields.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *, ST_X(coordinates) as longitude, ST_Y(coordinates) as latitude';
  values.push(id);
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Удаление локации
const deleteLocation = async (id) => {
  const query = 'DELETE FROM locations WHERE id = $1';
  await pool.query(query, [id]);
  return { success: true };
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation
};
