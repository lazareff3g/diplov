// routes/userRoutes.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С КРИТИЧЕСКИМИ ИСПРАВЛЕНИЯМИ
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ИСПРАВЛЕНИЕ: Создаем папку если её нет
const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Создана папка:', uploadDir);
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Только изображения формата jpeg, jpg, png, gif и webp!'));
  }
});

// Базовые маршруты
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// ИСПРАВЛЕНИЕ: Маршрут для обновления профиля
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, bio } = req.body;
    const userId = req.user.id;
    
    console.log('👤 Обновление профиля пользователя:', userId);
    console.log('📝 Новые данные:', { username, bio });
    
    // Валидация
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя пользователя не может быть пустым' 
      });
    }
    
    const { pool } = require('../db');
    
    // ИСПРАВЛЕНИЕ: Проверяем подключение к БД
    if (!pool) {
      throw new Error('База данных недоступна');
    }
    
    // Обновляем профиль в базе данных
    const updateQuery = `
      UPDATE users 
      SET username = $1, bio = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING id, username, email, bio, role, profile_image, created_at
    `;
    
    const result = await pool.query(updateQuery, [username.trim(), bio || '', userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }
    
    const updatedUser = result.rows[0];
    
    console.log('✅ Профиль успешно обновлен:', updatedUser);
    
    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при обновлении профиля',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Маршрут для загрузки аватарки
router.post('/profile/image', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('📸 Начало загрузки аватарки');
    console.log('📁 Файл:', req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : 'НЕТ ФАЙЛА');
    console.log('👤 Пользователь:', req.user ? { id: req.user.id, username: req.user.username } : 'НЕТ ПОЛЬЗОВАТЕЛЯ');
    
    if (!req.file) {
      console.log('❌ Файл не получен');
      return res.status(400).json({ 
        success: false, 
        message: 'Файл не загружен' 
      });
    }
    
    if (!req.user || !req.user.id) {
      console.log('❌ Пользователь не авторизован');
      return res.status(401).json({ 
        success: false, 
        message: 'Пользователь не авторизован' 
      });
    }
    
    const userId = req.user.id;
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    console.log('💾 Сохраняем в БД:', { userId, imageUrl });
    
    const { pool } = require('../db');
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем подключение к БД
    if (!pool) {
      console.error('❌ База данных недоступна');
      throw new Error('База данных недоступна');
    }
    
    // Проверяем что пользователь существует
    const userCheckQuery = 'SELECT id FROM users WHERE id = $1';
    const userCheck = await pool.query(userCheckQuery, [userId]);
    
    if (userCheck.rows.length === 0) {
      console.error('❌ Пользователь не найден в БД:', userId);
      throw new Error('Пользователь не найден в базе данных');
    }
    
    console.log('✅ Пользователь найден в БД');
    
    // Обновляем профиль пользователя с новым изображением
    const updateQuery = `
      UPDATE users 
      SET profile_image = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, username, email, bio, role, profile_image
    `;
    
    console.log('🔄 Выполняем SQL запрос:', updateQuery);
    console.log('🔄 Параметры:', [imageUrl, userId]);
    
    const result = await pool.query(updateQuery, [imageUrl, userId]);
    
    if (result.rows.length === 0) {
      console.error('❌ Обновление не выполнено');
      throw new Error('Не удалось обновить профиль пользователя');
    }
    
    console.log('✅ SQL запрос выполнен успешно');
    
    // ИСПРАВЛЕНИЕ: Также сохраняем в таблицу profile_images для истории (если таблица существует)
    try {
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'profile_images'
        );
      `;
      const tableExists = await pool.query(checkTableQuery);
      
      if (tableExists.rows[0].exists) {
        const checkResult = await pool.query(
          'SELECT id FROM profile_images WHERE user_id = $1',
          [userId]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            'UPDATE profile_images SET url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            [imageUrl, userId]
          );
        } else {
          await pool.query(
            'INSERT INTO profile_images (user_id, url, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [userId, imageUrl]
          );
        }
        console.log('✅ Таблица profile_images обновлена');
      } else {
        console.log('⚠️ Таблица profile_images не существует, пропускаем');
      }
    } catch (profileImageError) {
      console.warn('⚠️ Ошибка обновления profile_images (не критично):', profileImageError.message);
    }
    
    const updatedUser = result.rows[0];
    
    console.log('✅ Аватарка успешно сохранена:', {
      userId,
      imageUrl,
      filename: req.file.filename,
      updatedUser
    });
    
    res.json({
      success: true,
      message: 'Аватарка успешно загружена',
      imageUrl: imageUrl,
      filename: req.file.filename,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при загрузке аватарки:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Детали ошибки:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Удаляем загруженный файл в случае ошибки
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Файл удален после ошибки:', req.file.path);
      } catch (unlinkError) {
        console.error('❌ Ошибка удаления файла:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера при загрузке изображения',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        code: error.code,
        detail: error.detail
      } : undefined
    });
  }
});

module.exports = router;
