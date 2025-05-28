// routes/categoryRoutes.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С ПРЯМОЙ РЕАЛИЗАЦИЕЙ
const express = require('express');
const router = express.Router();

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../db');
    
    console.log('📂 Запрос всех категорий...');
    
    const result = await pool.query(`
      SELECT id, name, description, icon
      FROM categories
      ORDER BY id ASC
    `);
    
    console.log('✅ Загружено категорий:', result.rows.length);
    
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий',
      error: error.message
    });
  }
});

// ДОПОЛНИТЕЛЬНО: Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = require('../db');
    
    console.log('📂 Запрос категории с ID:', id);
    
    const result = await pool.query(`
      SELECT id, name, description, icon
      FROM categories
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }
    
    console.log('✅ Категория найдена:', result.rows[0]);
    
    res.json({
      success: true,
      category: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Ошибка получения категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категории',
      error: error.message
    });
  }
});

module.exports = router;
