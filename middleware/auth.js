// middleware/auth.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Получаем пользователя из базы данных
      const user = await userModel.findUserById(decoded.id);
      
      // ИСПРАВЛЕНИЕ: Проверяем, что пользователь существует
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Error:', error);
      
      // УЛУЧШЕНИЕ: Более детальная обработка ошибок JWT
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Токен истек' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Недействительный токен' });
      } else {
        return res.status(401).json({ message: 'Ошибка авторизации' });
      }
    }
  } else {
    // ИСПРАВЛЕНИЕ: Перенес проверку отсутствия токена
    return res.status(401).json({ message: 'Не авторизован, токен отсутствует' });
  }
};

// Middleware для проверки роли пользователя
exports.authorize = (...roles) => {  // УЛУЧШЕНИЕ: Используем rest параметры
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Доступ запрещен. Требуется роль: ${roles.join(' или ')}` 
      });
    }

    next();
  };
};

// ДОПОЛНЕНИЕ: Middleware для опциональной аутентификации
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findUserById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Игнорируем ошибки для опциональной аутентификации
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};
