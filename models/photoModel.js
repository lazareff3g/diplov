const pool = require('../db');

// Добавление фотографии к локации
const addPhotoToLocation = async (photoData) => {
  const { location_id, url, description, user_id } = photoData;
  
  const query = `
    INSERT INTO photos (location_id, url, description, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const values = [location_id, url, description, user_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение фотографий для локации
const getPhotosByLocationId = async (locationId) => {
  const query = `
    SELECT p.*, u.username
    FROM photos p
    JOIN users u ON p.user_id = u.id
    WHERE p.location_id = $1
    ORDER BY p.created_at DESC
  `;
  
  const result = await pool.query(query, [locationId]);
  return result.rows;
};

// Удаление фотографии
const deletePhoto = async (photoId, userId) => {
  // Проверяем, является ли пользователь владельцем фото
  const checkQuery = `
    SELECT * FROM photos WHERE id = $1 AND user_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [photoId, userId]);
  
  if (checkResult.rows.length === 0) {
    return { success: false, message: 'Unauthorized' };
  }
  
  const deleteQuery = 'DELETE FROM photos WHERE id = $1';
  await pool.query(deleteQuery, [photoId]);
  
  return { success: true };
};

module.exports = {
  addPhotoToLocation,
  getPhotosByLocationId,
  deletePhoto
};
