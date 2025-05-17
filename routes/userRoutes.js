const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Маршрут для регистрации нового пользователя
router.post('/register', registerUser);

// Маршрут для входа пользователя
router.post('/login', loginUser);

// Маршрут для получения профиля пользователя (защищенный)
router.get('/profile', protect, getUserProfile);

module.exports = router;
