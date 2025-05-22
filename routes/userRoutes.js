const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profiles/'); // Убедитесь, что эта папка существует
  },
  filename: function(req, file, cb) {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение размера файла (5MB)
  fileFilter: function(req, file, cb) {
    // Проверка типа файла
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Только изображения формата jpeg, jpg, png и gif!'));
  }
});

// Маршрут для регистрации нового пользователя
router.post('/register', registerUser);

// Маршрут для входа пользователя
router.post('/login', loginUser);

// Маршрут для получения профиля пользователя (защищенный)
router.get('/profile', protect, getUserProfile);

// Маршрут для обновления профиля пользователя (защищенный)
// Временная функция вместо updateUserProfile
router.put('/profile', protect, (req, res) => {
  res.status(200).json({ message: 'Профиль обновлен успешно' });
});

// Маршрут для загрузки изображения профиля (защищенный)
router.post('/profile/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    // Путь к загруженному файлу
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Обновляем запись в базе данных
    const { pool } = require('../db');
    
    // Проверяем наличие req.user и req.user.id
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      console.error('req.user или req.user.id не определены');
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }
    
    const userId = req.user.id;
    console.log('User ID:', userId); // Отладочный вывод
    
    // Проверяем, есть ли уже запись для этого пользователя
    const checkResult = await pool.query(
      'SELECT * FROM profile_images WHERE user_id = $1',
      [userId]
    );
    
    if (checkResult.rows.length > 0) {
      // Обновляем существующую запись
      await pool.query(
        'UPDATE profile_images SET url = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [imageUrl, userId]
      );
    } else {
      // Создаем новую запись
      await pool.query(
        'INSERT INTO profile_images (user_id, url, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [userId, imageUrl]
      );
    }
    
    // Обновляем поле profile_image в таблице users
    console.log('Выполняем запрос UPDATE users с параметрами:', imageUrl, userId);
    await pool.query(
      'UPDATE users SET profile_image = $1 WHERE id = $2',
      [imageUrl, userId]
    );
    
    // Получаем обновленные данные пользователя для ответа
    const updatedUser = await pool.query(
      'SELECT id, username, email, role, profile_image FROM users WHERE id = $1',
      [userId]
    );
    
    // Проверяем результат запроса
    if (updatedUser.rows.length === 0) {
      console.error('Пользователь не найден после обновления');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Добавляем информацию о пользователе в ответ
    const userData = updatedUser.rows[0];
    console.log('Обновленные данные пользователя:', userData);
    
    // Отправляем успешный ответ с URL изображения
    res.status(200).json({ 
      success: true, 
      imageUrl: imageUrl,
      user: userData,
      message: 'Изображение профиля успешно обновлено'
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения профиля:', error);
    res.status(500).json({ error: 'Не удалось обновить изображение профиля' });
  }
});

module.exports = router;
