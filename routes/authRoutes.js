// routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
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

// Rate limiting для защиты от брутфорса
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток за 15 минут
  message: {
    message: 'Слишком много попыток входа. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем rate limiting для успешных запросов
    return req.method === 'GET';
  }
});

// Более строгий rate limiting для регистрации
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // максимум 3 регистрации в час с одного IP
  message: {
    message: 'Слишком много попыток регистрации. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting для смены пароля
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // максимум 3 смены пароля в час
  message: {
    message: 'Слишком много попыток смены пароля. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Публичные маршруты
router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);

// Защищенные маршруты (требуют аутентификации)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/verify', protect, verifyToken);
router.put('/change-password', protect, passwordLimiter, changePassword);

// Маршрут для выхода (очистка токена на клиенте)
router.post('/logout', protect, (req, res) => {
  // На сервере ничего не делаем, так как JWT stateless
  // Клиент сам удалит токен из localStorage
  console.log(`✅ Пользователь ${req.user.username} вышел из системы`);
  
  res.status(200).json({
    message: 'Успешный выход из системы'
  });
});

// Middleware для логирования всех auth запросов
router.use((req, res, next) => {
  console.log(`🔐 Auth request: ${req.method} ${req.path} from ${req.ip}`);
  next();
});

module.exports = router;
