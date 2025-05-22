const pool = require('../db');

// Добавление отзыва к локации
const addReview = async (reviewData) => {
  const { location_id, user_id, rating, comment } = reviewData;
  
  const query = `
    INSERT INTO reviews (location_id, user_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const values = [location_id, user_id, rating, comment];
  const result = await pool.query(query, values);
  
  // Обновляем средний рейтинг локации
  await updateLocationRating(location_id);
  
  return result.rows[0];
};

// Получение отзывов для локации
const getReviewsByLocationId = async (locationId) => {
  const query = `
    SELECT r.*, u.username
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.location_id = $1
    ORDER BY r.created_at DESC
  `;
  
  const result = await pool.query(query, [locationId]);
  return result.rows;
};

// Обновление среднего рейтинга локации
const updateLocationRating = async (locationId) => {
  const query = `
    UPDATE locations
    SET avg_rating = (
      SELECT AVG(rating)
      FROM reviews
      WHERE location_id = $1
    )
    WHERE id = $1
  `;
  
  await pool.query(query, [locationId]);
};

// Удаление отзыва
const deleteReview = async (reviewId, userId) => {
  // Проверяем, является ли пользователь автором отзыва
  const checkQuery = `
    SELECT location_id FROM reviews WHERE id = $1 AND user_id = $2
  `;
  const checkResult = await pool.query(checkQuery, [reviewId, userId]);
  
  if (checkResult.rows.length === 0) {
    return { success: false, message: 'Unauthorized' };
  }
  
  const locationId = checkResult.rows[0].location_id;
  
  const deleteQuery = 'DELETE FROM reviews WHERE id = $1';
  await pool.query(deleteQuery, [reviewId]);
  
  // Обновляем средний рейтинг локации
  await updateLocationRating(locationId);
  
  return { success: true };
};

module.exports = {
  addReview,
  getReviewsByLocationId,
  deleteReview
};
