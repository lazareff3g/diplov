// routes/reviewRoutes.js - РАБОЧАЯ ВЕРСИЯ
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Получение отзывов для локации
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    console.log('📝 Запрос отзывов для локации:', locationId);
    
    // Пока возвращаем пустой массив (заглушка)
    res.json({
      success: true,
      reviews: [],
      averageRating: 0
    });
  } catch (error) {
    console.error('❌ Ошибка получения отзывов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении отзывов'
    });
  }
});

// Добавление отзыва
router.post('/', protect, async (req, res) => {
  try {
    const { location_id, rating, comment } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Добавление отзыва:', { location_id, rating, comment, userId });
    
    // Пока возвращаем успешный ответ (заглушка)
    res.status(201).json({
      success: true,
      message: 'Отзыв успешно добавлен',
      review: {
        id: Date.now(),
        location_id,
        user_id: userId,
        rating,
        comment,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Ошибка добавления отзыва:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении отзыва'
    });
  }
});

module.exports = router;
