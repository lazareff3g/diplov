// routes/authRoutes.js - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ RATE LIMITING
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  verifyToken,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// Middleware для логирования
router.use((req, res, next) => {
  console.log(`🔐 Auth request: ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Простой тестовый маршрут
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes работают!', 
    timestamp: new Date().toISOString() 
  });
});

// Публичные маршруты (БЕЗ RATE LIMITING)
router.post('/register', register);
router.post('/login', login);

// Защищенные маршруты (требуют аутентификации)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/verify', protect, verifyToken);
router.put('/change-password', protect, changePassword);

// Маршрут для выхода
router.post('/logout', protect, (req, res) => {
  console.log(`✅ Пользователь ${req.user?.username || 'Unknown'} вышел из системы`);
  
  res.status(200).json({
    message: 'Успешный выход из системы'
  });
});

module.exports = router;
