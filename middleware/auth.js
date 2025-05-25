// middleware/auth.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С ЛОГИРОВАНИЕМ
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.protect = async (req, res, next) => {
  let token;

  console.log('🔐 Middleware protect: начало проверки');
  console.log('🔐 Headers authorization:', req.headers.authorization);
  console.log('🔐 URL:', req.originalUrl);
  console.log('🔐 Method:', req.method);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Токен извлечен:', token ? 'ДА' : 'НЕТ');
      console.log('🔑 Длина токена:', token ? token.length : 0);

      // Проверяем токен
      console.log('🔍 Проверяем токен с JWT_SECRET...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Токен декодирован:', decoded);

      // Получаем пользователя из базы данных
      console.log('👤 Ищем пользователя в БД по ID:', decoded.id);
      const user = await userModel.findUserById(decoded.id);
      console.log('👤 Пользователь найден:', user ? 'ДА' : 'НЕТ');
      
      if (user) {
        console.log('👤 Данные пользователя:', {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });
      }
      
      // ИСПРАВЛЕНИЕ: Проверяем, что пользователь существует
      if (!user) {
        console.log('❌ Пользователь не найден в БД');
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      req.user = user;
      console.log('✅ Middleware protect: пользователь установлен в req.user');
      next();
    } catch (error) {
      console.error('❌ JWT Error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // УЛУЧШЕНИЕ: Более детальная обработка ошибок JWT
      if (error.name === 'TokenExpiredError') {
        console.log('❌ Токен истек');
        return res.status(401).json({ message: 'Токен истек' });
      } else if (error.name === 'JsonWebTokenError') {
        console.log('❌ Недействительный токен');
        return res.status(401).json({ message: 'Недействительный токен' });
      } else if (error.name === 'NotBeforeError') {
        console.log('❌ Токен еще не активен');
        return res.status(401).json({ message: 'Токен еще не активен' });
      } else {
        console.log('❌ Общая ошибка авторизации');
        return res.status(401).json({ message: 'Ошибка авторизации' });
      }
    }
  } else {
    // ИСПРАВЛЕНИЕ: Перенес проверку отсутствия токена
    console.log('❌ Токен отсутствует в заголовках');
    console.log('❌ Authorization header:', req.headers.authorization);
    return res.status(401).json({ message: 'Не авторизован, токен отсутствует' });
  }
};

// Middleware для проверки роли пользователя
exports.authorize = (...roles) => {  // УЛУЧШЕНИЕ: Используем rest параметры
  return (req, res, next) => {
    console.log('🔒 Проверка роли пользователя');
    console.log('🔒 Требуемые роли:', roles);
    console.log('🔒 Роль пользователя:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ Пользователь не авторизован для проверки роли');
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Недостаточно прав:', req.user.role, 'не в', roles);
      return res.status(403).json({ 
        message: `Доступ запрещен. Требуется роль: ${roles.join(' или ')}` 
      });
    }

    console.log('✅ Роль пользователя подходит');
    next();
  };
};

// ДОПОЛНЕНИЕ: Middleware для опциональной аутентификации
exports.optionalAuth = async (req, res, next) => {
  let token;

  console.log('🔓 Optional auth: начало проверки');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findUserById(decoded.id);
      
      if (user) {
        req.user = user;
        console.log('✅ Optional auth: пользователь установлен');
      } else {
        console.log('⚠️ Optional auth: пользователь не найден');
      }
    } catch (error) {
      // Игнорируем ошибки для опциональной аутентификации
      console.log('⚠️ Optional auth failed:', error.message);
    }
  } else {
    console.log('⚠️ Optional auth: токен отсутствует');
  }

  next();
};

// ДОБАВЛЕНИЕ: Middleware для проверки JWT_SECRET
exports.checkJWTSecret = (req, res, next) => {
  console.log('🔐 Проверка JWT_SECRET...');
  console.log('🔐 JWT_SECRET установлен:', !!process.env.JWT_SECRET);
  console.log('🔐 JWT_SECRET длина:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET не установлен в переменных окружения!');
    return res.status(500).json({ message: 'Ошибка конфигурации сервера' });
  }
  
  next();
};
