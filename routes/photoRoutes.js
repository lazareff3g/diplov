// routes/photoRoutes.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С БАЗОЙ ДАННЫХ И УДАЛЕНИЕМ
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/photos');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'photo-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// ИСПРАВЛЕНИЕ: Получение фотографий из базы данных
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    console.log('📸 Запрос фотографий для локации:', locationId);
    
    const { pool } = require('../db');
    
    // РЕАЛЬНЫЙ ЗАПРОС К БАЗЕ ДАННЫХ
    const result = await pool.query(`
      SELECT 
        p.id,
        p.url,
        p.description,
        p.user_id,
        p.created_at,
        u.username
      FROM photos p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.location_id = $1
      ORDER BY p.created_at DESC
    `, [locationId]);
    
    console.log('✅ Найдено фотографий:', result.rows.length);
    
    res.json({
      success: true,
      photos: result.rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения фотографий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении фотографий'
    });
  }
});

// ИСПРАВЛЕНИЕ: Сохранение фото в базу данных
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { location_id, description } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен'
      });
    }
    
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    
    console.log('📸 Сохранение фотографии в БД:', { 
      location_id, 
      description, 
      userId, 
      filename: req.file.filename,
      url: photoUrl 
    });
    
    const { pool } = require('../db');
    
    // СОХРАНЯЕМ В БАЗУ ДАННЫХ
    const result = await pool.query(`
      INSERT INTO photos (location_id, user_id, url, description)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        location_id,
        user_id,
        url,
        description,
        created_at
    `, [location_id, userId, photoUrl, description || null]);
    
    const savedPhoto = result.rows[0];
    
    // Получаем имя пользователя
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    savedPhoto.username = userResult.rows[0]?.username || 'Неизвестный';
    
    console.log('✅ Фотография сохранена в БД:', savedPhoto);
    
    res.status(201).json({
      success: true,
      message: 'Фотография успешно загружена',
      photo: savedPhoto
    });
  } catch (error) {
    console.error('❌ Ошибка загрузки фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при загрузке фотографии'
    });
  }
});

// ДОБАВЛЕНО: Удаление фотографии
router.delete('/:photoId', protect, async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ Удаление фотографии:', { photoId, userId });
    
    const { pool } = require('../db');
    
    // Получаем информацию о фотографии
    const photoResult = await pool.query(`
      SELECT id, url, user_id 
      FROM photos 
      WHERE id = $1
    `, [photoId]);
    
    if (photoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }
    
    const photo = photoResult.rows[0];
    
    // Проверяем права доступа
    if (photo.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для удаления этой фотографии'
      });
    }
    
    // Удаляем файл с диска
    const filePath = path.join(__dirname, '..', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Файл удален с диска:', filePath);
    }
    
    // Удаляем запись из базы данных
    await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);
    
    console.log('✅ Фотография удалена из БД');
    
    res.json({
      success: true,
      message: 'Фотография успешно удалена'
    });
  } catch (error) {
    console.error('❌ Ошибка удаления фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении фотографии'
    });
  }
});

module.exports = router;
