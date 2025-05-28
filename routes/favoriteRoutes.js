// routes/favoriteRoutes.js - ПОЛНАЯ ВЕРСИЯ С РАСШИРЕННОЙ ОТЛАДКОЙ
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Получение всех избранных локаций пользователя
router.get('/', protect, async (req, res) => {
  try {
    const { pool } = require('../db');
    const userId = req.user.id;
    
    console.log('💖 ОТЛАДКА - Загрузка избранных локаций для пользователя:', userId);
    console.log('💖 ОТЛАДКА - req.user полностью:', req.user);
    console.log('💖 ОТЛАДКА - Время запроса:', new Date().toISOString());
    
    // ДОБАВЛЕНО: Проверяем подключение к БД
    console.log('💖 ОТЛАДКА - Проверяем подключение к БД...');
    await pool.query('SELECT NOW()');
    console.log('💖 ОТЛАДКА - Подключение к БД работает');
    
    // ДОБАВЛЕНО: Проверяем существование таблицы favorites
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `);
    console.log('💖 ОТЛАДКА - Таблица favorites существует:', tableCheck.rows[0].exists);
    
    // ДОБАВЛЕНО: Проверяем общее количество записей в favorites
    const totalCount = await pool.query('SELECT COUNT(*) FROM favorites');
    console.log('💖 ОТЛАДКА - Всего записей в favorites:', totalCount.rows[0].count);
    
    // ДОБАВЛЕНО: Проверяем записи для конкретного пользователя
    const userFavoritesCount = await pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [userId]);
    console.log('💖 ОТЛАДКА - Записей для пользователя', userId, ':', userFavoritesCount.rows[0].count);
    
    console.log('💖 ОТЛАДКА - Выполняем основной SQL запрос...');
    
    const result = await pool.query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        l.id, l.name, l.description, l.address,
        ST_X(l.coordinates) as longitude,
        ST_Y(l.coordinates) as latitude,
        l.category_id, l.created_at,
        c.name as category_name,
        c.icon as category_icon
      FROM favorites f
      JOIN locations l ON f.location_id = l.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);
    
    console.log('💖 ОТЛАДКА - SQL запрос выполнен успешно');
    console.log('💖 ОТЛАДКА - Найдено избранных локаций:', result.rows.length);
    console.log('💖 ОТЛАДКА - Данные результата:', result.rows);
    
    res.json({
      success: true,
      favorites: result.rows
    });
  } catch (error) {
    console.error('❌ ОТЛАДКА - Ошибка получения избранного:', error);
    console.error('❌ ОТЛАДКА - Тип ошибки:', error.name);
    console.error('❌ ОТЛАДКА - Сообщение ошибки:', error.message);
    console.error('❌ ОТЛАДКА - Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении избранного: ' + error.message,
      favorites: []
    });
  }
});

// Проверка избранного для конкретной локации
router.get('/check/:locationId', protect, async (req, res) => {
  try {
    const { pool } = require('../db');
    const { locationId } = req.params;
    const userId = req.user.id;
    
    console.log('🔍 ОТЛАДКА - Проверка избранного:', { locationId, userId });
    console.log('🔍 ОТЛАДКА - Тип locationId:', typeof locationId);
    console.log('🔍 ОТЛАДКА - Тип userId:', typeof userId);
    
    const result = await pool.query(`
      SELECT id FROM favorites 
      WHERE user_id = $1 AND location_id = $2
    `, [userId, locationId]);
    
    const isFavorite = result.rows.length > 0;
    
    console.log('🔍 ОТЛАДКА - SQL результат:', result.rows);
    console.log('🔍 ОТЛАДКА - Результат проверки избранного:', isFavorite);
    
    res.json({
      success: true,
      isFavorite: isFavorite
    });
  } catch (error) {
    console.error('❌ ОТЛАДКА - Ошибка проверки избранного:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке избранного: ' + error.message,
      isFavorite: false
    });
  }
});

// Добавление в избранное
router.post('/', protect, async (req, res) => {
  try {
    const { pool } = require('../db');
    const { location_id } = req.body;
    const userId = req.user.id;
    
    console.log('💖 ОТЛАДКА - Добавление в избранное:', { location_id, userId });
    console.log('💖 ОТЛАДКА - req.body полностью:', req.body);
    console.log('💖 ОТЛАДКА - Тип location_id:', typeof location_id);
    console.log('💖 ОТЛАДКА - Тип userId:', typeof userId);
    
    // Проверяем что локация существует
    console.log('💖 ОТЛАДКА - Проверяем существование локации...');
    const locationCheck = await pool.query(
      'SELECT id, name FROM locations WHERE id = $1', 
      [location_id]
    );
    
    console.log('💖 ОТЛАДКА - Результат проверки локации:', locationCheck.rows);
    
    if (locationCheck.rows.length === 0) {
      console.log('❌ ОТЛАДКА - Локация не найдена');
      return res.status(404).json({
        success: false,
        message: 'Локация не найдена'
      });
    }
    
    // Проверяем что еще не в избранном
    console.log('💖 ОТЛАДКА - Проверяем дублирование...');
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND location_id = $2',
      [userId, location_id]
    );
    
    console.log('💖 ОТЛАДКА - Результат проверки дублирования:', existingFavorite.rows);
    
    if (existingFavorite.rows.length > 0) {
      console.log('⚠️ ОТЛАДКА - Локация уже в избранном');
      return res.status(400).json({
        success: false,
        message: 'Локация уже в избранном'
      });
    }
    
    // Добавляем в избранное
    console.log('💖 ОТЛАДКА - Добавляем в избранное...');
    const result = await pool.query(`
      INSERT INTO favorites (user_id, location_id, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, created_at
    `, [userId, location_id]);
    
    console.log('✅ ОТЛАДКА - Локация добавлена в избранное:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Локация добавлена в избранное',
      favorite: result.rows[0]
    });
  } catch (error) {
    console.error('❌ ОТЛАДКА - Ошибка добавления в избранное:', error);
    console.error('❌ ОТЛАДКА - Код ошибки:', error.code);
    console.error('❌ ОТЛАДКА - Stack trace:', error.stack);
    
    // Проверяем на дублирование (уникальное ограничение)
    if (error.code === '23505') {
      console.log('⚠️ ОТЛАДКА - Ошибка дублирования (23505)');
      return res.status(400).json({
        success: false,
        message: 'Локация уже в избранном'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении в избранное: ' + error.message
    });
  }
});

// Удаление из избранного
router.delete('/:locationId', protect, async (req, res) => {
  try {
    const { pool } = require('../db');
    const { locationId } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ ОТЛАДКА - Удаление из избранного:', { locationId, userId });
    console.log('🗑️ ОТЛАДКА - Тип locationId:', typeof locationId);
    console.log('🗑️ ОТЛАДКА - Тип userId:', typeof userId);
    
    const result = await pool.query(`
      DELETE FROM favorites 
      WHERE user_id = $1 AND location_id = $2
      RETURNING id
    `, [userId, locationId]);
    
    console.log('🗑️ ОТЛАДКА - Результат удаления:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('❌ ОТЛАДКА - Локация не найдена в избранном');
      return res.status(404).json({
        success: false,
        message: 'Локация не найдена в избранном'
      });
    }
    
    console.log('✅ ОТЛАДКА - Локация удалена из избранного');
    
    res.json({
      success: true,
      message: 'Локация удалена из избранного'
    });
  } catch (error) {
    console.error('❌ ОТЛАДКА - Ошибка удаления из избранного:', error);
    console.error('❌ ОТЛАДКА - Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении из избранного: ' + error.message
    });
  }
});

module.exports = router;
