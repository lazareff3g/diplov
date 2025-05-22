const pool = require('../db');

// Добавление локации в избранное
const addToFavorites = async (userId, locationId) => {
  // Проверяем, не добавлена ли уже локация в избранное
  const checkQuery = `
    SELECT * FROM favorites WHERE user_id = $1 AND location_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [userId, locationId]);
  
  if (checkResult.rows.length > 0) {
    return { success: false, message: 'Already in favorites' };
  }
  
  const query = `
    INSERT INTO favorites (user_id, location_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  
  const result = await pool.query(query, [userId, locationId]);
  return { success: true, favorite: result.rows[0] };
};

// Удаление локации из избранного
const removeFromFavorites = async (userId, locationId) => {
  const query = `
    DELETE FROM favorites
    WHERE user_id = $1 AND location_id = $2
  `;
  
  await pool.query(query, [userId, locationId]);
  return { success: true };
};

// Получение избранных локаций пользователя
const getFavoritesByUserId = async (userId) => {
  const query = `
    SELECT l.*, 
           ST_X(l.coordinates) as longitude, 
           ST_Y(l.coordinates) as latitude,
           u.username as creator_username, 
           c.name as category_name
    FROM favorites f
    JOIN locations l ON f.location_id = l.id
    JOIN users u ON l.created_by = u.id
    JOIN categories c ON l.category_id = c.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Проверка, находится ли локация в избранном у пользователя
const checkIsFavorite = async (userId, locationId) => {
  const query = `
    SELECT * FROM favorites
    WHERE user_id = $1 AND location_id = $2
  `;
  
  const result = await pool.query(query, [userId, locationId]);
  return result.rows.length > 0;
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavoritesByUserId,
  checkIsFavorite
};
