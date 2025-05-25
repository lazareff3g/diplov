// server.js - ИСПРАВЛЕННАЯ ВЕРСИЯ С CORS ДЛЯ ИЗОБРАЖЕНИЙ
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ИСПРАВЛЕНИЕ: CORS должен быть ПЕРВЫМ и с правильными настройками
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Базовые middleware
app.use(express.json());

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Специальная обработка статических файлов с CORS
app.use('/uploads', (req, res, next) => {
  // Добавляем CORS заголовки для статических файлов
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'public, max-age=31536000'); // Кэшируем на год
  
  console.log(`📁 Запрос статического файла: ${req.originalUrl}`);
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  // Добавляем опции для статических файлов
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    console.log(`✅ Отдаем статический файл: ${path}`);
  }
}));

// ДОБАВЛЕНИЕ: Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Базовые маршруты
app.get('/', (req, res) => {
  res.json({ 
    message: 'Photo Locations API Server is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint works!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage()
  });
});

// ДОБАВЛЕНИЕ: Тестовый маршрут для проверки конкретного изображения
app.get('/test-image/:filename', (req, res) => {
  const fs = require('fs');
  const filepath = path.join(__dirname, 'uploads', 'profiles', req.params.filename);
  
  console.log(`🔍 Проверяем файл: ${filepath}`);
  
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    res.json({
      exists: true,
      path: filepath,
      size: stats.size,
      url: `/uploads/profiles/${req.params.filename}`,
      fullUrl: `http://localhost:${PORT}/uploads/profiles/${req.params.filename}`,
      modified: stats.mtime
    });
  } else {
    res.status(404).json({
      exists: false,
      path: filepath,
      message: 'Файл не найден'
    });
  }
});

// ДОБАВЛЕНИЕ: Тестовый маршрут для проверки статических файлов
app.get('/uploads/test', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads', 'profiles');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      message: 'Uploads directory is accessible',
      uploadsPath,
      profilesPath: uploadsPath,
      files: files.slice(0, 10), // Показываем первые 10 файлов
      totalFiles: files.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error reading uploads directory',
      error: error.message,
      uploadsPath
    });
  }
});

// Подключение маршрутов с обработкой ошибок
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes подключены');
} catch (error) {
  console.error('❌ Ошибка в authRoutes:', error.message);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes подключены');
} catch (error) {
  console.error('❌ Ошибка в userRoutes:', error.message);
}

try {
  const locationRoutes = require('./routes/locationRoutes');
  app.use('/api/locations', locationRoutes);
  console.log('✅ Location routes подключены');
} catch (error) {
  console.error('❌ Ошибка в locationRoutes:', error.message);
}

try {
  const categoryRoutes = require('./routes/categoryRoutes');
  app.use('/api/categories', categoryRoutes);
  console.log('✅ Category routes подключены');
} catch (error) {
  console.error('❌ Ошибка в categoryRoutes:', error.message);
}

// ИСПРАВЛЕНИЕ: Условное подключение api.js (если файл существует)
try {
  const apiRoutes = require('./routes/api');
  app.use('/api', apiRoutes);
  console.log('✅ API routes подключены');
} catch (error) {
  console.warn('⚠️ api.js не найден или содержит ошибки:', error.message);
}

// ДОБАВЛЕНИЕ: Middleware для обработки ошибок multer
app.use((error, req, res, next) => {
  // Обработка ошибок multer
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Файл слишком большой. Максимальный размер: 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Слишком много файлов'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Неожиданное поле файла'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Ошибка загрузки файла'
        });
    }
  }
  
  // Обработка ошибок валидации файлов
  if (error.message && error.message.includes('Только изображения')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  
  // Различные типы ошибок
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      error: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Неавторизованный доступ',
      error: err.message
    });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'Файл не найден',
      error: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Обработка 404 ошибок
app.use('*', (req, res) => {
  console.log('❌ 404 - Маршрут не найден:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /test',
      'GET /uploads/test',
      'GET /test-image/:filename',
      'GET /uploads/profiles/:filename',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'POST /api/users/profile/image',
      'GET /api/locations',
      'POST /api/locations',
      'GET /api/locations/user/:userId',
      'GET /api/categories'
    ]
  });
});

// ДОБАВЛЕНИЕ: Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM получен. Завершение работы сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT получен. Завершение работы сервера...');
  process.exit(0);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
  console.log(`📍 Test: http://localhost:${PORT}/test`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`📁 Uploads Test: http://localhost:${PORT}/uploads/test`);
  console.log(`🖼️ Test Image: http://localhost:${PORT}/test-image/FILENAME`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // ДОБАВЛЕНИЕ: Проверка существования папки uploads
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsPath)) {
    console.log('📁 Создание папки uploads...');
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  
  const profilesPath = path.join(uploadsPath, 'profiles');
  if (!fs.existsSync(profilesPath)) {
    console.log('📁 Создание папки uploads/profiles...');
    fs.mkdirSync(profilesPath, { recursive: true });
  }
  
  console.log('✅ Папки uploads готовы');
  
  // ДОБАВЛЕНИЕ: Проверяем существующие файлы
  try {
    const files = fs.readdirSync(profilesPath);
    console.log(`📁 Найдено ${files.length} файлов в uploads/profiles`);
    if (files.length > 0) {
      console.log('📄 Последние файлы:', files.slice(-3));
    }
  } catch (error) {
    console.error('❌ Ошибка чтения папки uploads:', error.message);
  }
  
  // Проверяем подключение к базе данных
  try {
    const { pool } = require('./db');
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
      } else {
        console.log('✅ База данных подключена:', result.rows[0].now);
      }
    });
  } catch (dbError) {
    console.error('❌ Ошибка инициализации БД:', dbError.message);
  }
});
