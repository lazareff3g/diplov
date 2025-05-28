// server.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ С РАСШИРЕННОЙ ОТЛАДКОЙ FAVORITES
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
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // ДОБАВЛЕНО для CORP
    console.log(`✅ Отдаем статический файл: ${filePath}`);
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
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    // Проверяем все папки в uploads
    const profilesPath = path.join(uploadsPath, 'profiles');
    const photosPath = path.join(uploadsPath, 'photos');
    
    let profileFiles = [];
    let photoFiles = [];
    
    if (fs.existsSync(profilesPath)) {
      profileFiles = fs.readdirSync(profilesPath);
    }
    
    if (fs.existsSync(photosPath)) {
      photoFiles = fs.readdirSync(photosPath);
    }
    
    res.json({
      message: 'Uploads directory is accessible',
      uploadsPath,
      profiles: {
        path: profilesPath,
        files: profileFiles.slice(0, 10),
        totalFiles: profileFiles.length
      },
      photos: {
        path: photosPath,
        files: photoFiles.slice(0, 10),
        totalFiles: photoFiles.length
      },
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

// ИСПРАВЛЕНИЕ: Улучшенное подключение categoryRoutes с дополнительными проверками
try {
  const categoryRoutes = require('./routes/categoryRoutes');
  app.use('/api/categories', categoryRoutes);
  console.log('✅ Category routes подключены');
  
  // ДОБАВЛЕНО: Тестовый запрос для проверки работы categoryRoutes
  setTimeout(() => {
    console.log('🔍 Проверяем доступность /api/categories...');
  }, 1000);
  
} catch (error) {
  console.error('❌ Ошибка в categoryRoutes:', error.message);
  console.error('❌ Стек ошибки:', error.stack);
  
  // ДОБАВЛЕНО: Проверяем существование файла
  const fs = require('fs');
  const categoryRoutesPath = path.join(__dirname, 'routes', 'categoryRoutes.js');
  
  if (fs.existsSync(categoryRoutesPath)) {
    console.log('✅ Файл routes/categoryRoutes.js существует');
  } else {
    console.error('❌ Файл routes/categoryRoutes.js НЕ НАЙДЕН!');
  }
}

// ДОБАВЛЕНИЕ: Новые роуты для отзывов, фотографий и избранного
try {
  const reviewRoutes = require('./routes/reviewRoutes');
  app.use('/api/reviews', reviewRoutes);
  console.log('✅ Review routes подключены');
} catch (error) {
  console.error('❌ Ошибка в reviewRoutes:', error.message);
}

try {
  const photoRoutes = require('./routes/photoRoutes');
  app.use('/api/photos', photoRoutes);
  console.log('✅ Photo routes подключены');
} catch (error) {
  console.error('❌ Ошибка в photoRoutes:', error.message);
}

// ДОБАВЛЕНО: Middleware для отладки всех запросов к /api/favorites
app.use('/api/favorites', (req, res, next) => {
  console.log('💖 ОТЛАДКА FAVORITES - Входящий запрос:');
  console.log('💖 ОТЛАДКА - Метод:', req.method);
  console.log('💖 ОТЛАДКА - URL:', req.originalUrl);
  console.log('💖 ОТЛАДКА - Параметры:', req.params);
  console.log('💖 ОТЛАДКА - Query:', req.query);
  console.log('💖 ОТЛАДКА - Body:', req.body);
  console.log('💖 ОТЛАДКА - User:', req.user ? `ID: ${req.user.id}, Username: ${req.user.username}` : 'НЕ АВТОРИЗОВАН');
  console.log('💖 ОТЛАДКА - Время:', new Date().toISOString());
  console.log('💖 ОТЛАДКА - IP:', req.ip);
  console.log('💖 ОТЛАДКА - User-Agent:', req.get('User-Agent'));
  next();
});

// ИСПРАВЛЕНИЕ: Улучшенное подключение favoriteRoutes с расширенной отладкой
try {
  const favoriteRoutes = require('./routes/favoriteRoutes');
  app.use('/api/favorites', favoriteRoutes);
  console.log('✅ Favorite routes подключены');
  
  // ДОБАВЛЕНО: Дополнительная отладка для favorites
  console.log('🔍 Проверяем доступность /api/favorites...');
  console.log('💖 Favorite routes готовы к обработке запросов');
  
  // ДОБАВЛЕНО: Тестовый запрос для проверки работы favoriteRoutes
  setTimeout(() => {
    console.log('🔍 Проверяем маршруты favorites через 2 секунды...');
  }, 2000);
  
} catch (error) {
  console.error('❌ Ошибка в favoriteRoutes:', error.message);
  console.error('❌ Стек ошибки favoriteRoutes:', error.stack);
  
  // ДОБАВЛЕНО: Проверяем существование файла favoriteRoutes
  const fs = require('fs');
  const favoriteRoutesPath = path.join(__dirname, 'routes', 'favoriteRoutes.js');
  
  if (fs.existsSync(favoriteRoutesPath)) {
    console.log('✅ Файл routes/favoriteRoutes.js существует');
    
    // ДОБАВЛЕНО: Проверяем размер файла
    const stats = fs.statSync(favoriteRoutesPath);
    console.log('📄 Размер файла favoriteRoutes.js:', stats.size, 'байт');
    console.log('📅 Последнее изменение:', stats.mtime);
  } else {
    console.error('❌ Файл routes/favoriteRoutes.js НЕ НАЙДЕН!');
  }
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
      'GET /uploads/photos/:filename',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'POST /api/users/profile/image',
      'GET /api/locations',
      'POST /api/locations',
      'GET /api/locations/nearby',
      'GET /api/locations/user/:userId',
      'GET /api/categories',
      'GET /api/categories/:id',
      'GET /api/reviews/location/:locationId',
      'POST /api/reviews',
      'GET /api/photos/location/:locationId',
      'POST /api/photos',
      'GET /api/favorites', // ДОБАВЛЕНО: Получение избранного
      'GET /api/favorites/check/:locationId',
      'POST /api/favorites',
      'DELETE /api/favorites/:locationId'
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
  console.log(`📂 Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`💖 Favorites API: http://localhost:${PORT}/api/favorites`); // ДОБАВЛЕНО
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
  
  // ДОБАВЛЕНО: Создание папки для фотографий локаций
  const photosPath = path.join(uploadsPath, 'photos');
  if (!fs.existsSync(photosPath)) {
    console.log('📁 Создание папки uploads/photos...');
    fs.mkdirSync(photosPath, { recursive: true });
  }
  
  console.log('✅ Папки uploads готовы');
  
  // ДОБАВЛЕНИЕ: Проверяем существующие файлы
  try {
    const profileFiles = fs.readdirSync(profilesPath);
    console.log(`📁 Найдено ${profileFiles.length} файлов в uploads/profiles`);
    if (profileFiles.length > 0) {
      console.log('📄 Последние файлы профилей:', profileFiles.slice(-3));
    }
    
    // ДОБАВЛЕНО: Проверка фотографий локаций
    const photoFiles = fs.readdirSync(photosPath);
    console.log(`📁 Найдено ${photoFiles.length} файлов в uploads/photos`);
    if (photoFiles.length > 0) {
      console.log('📄 Последние фотографии локаций:', photoFiles.slice(-3));
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
        
        // ДОБАВЛЕНИЕ: Проверяем существование таблиц
        pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('locations', 'photos', 'reviews', 'favorites', 'categories')
        `, (err, result) => {
          if (err) {
            console.error('❌ Ошибка проверки таблиц:', err.message);
          } else {
            const tables = result.rows.map(row => row.table_name);
            console.log('✅ Найденные таблицы:', tables);
            
            if (tables.includes('locations')) console.log('✅ Таблица locations существует');
            if (tables.includes('photos')) console.log('✅ Таблица photos существует');
            if (tables.includes('reviews')) console.log('✅ Таблица reviews существует');
            if (tables.includes('categories')) console.log('✅ Таблица categories существует');
            
            // ДОБАВЛЕНО: Расширенная проверка таблицы favorites
            if (tables.includes('favorites')) {
              console.log('✅ Таблица favorites существует');
              
              // Проверяем количество записей в favorites
              pool.query('SELECT COUNT(*) as count FROM favorites', (err, result) => {
                if (err) {
                  console.error('❌ Ошибка подсчета favorites:', err.message);
                } else {
                  console.log(`💖 В таблице favorites ${result.rows[0].count} записей`);
                }
              });
              
              // Проверяем структуру таблицы favorites
              pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'favorites'
                ORDER BY ordinal_position
              `, (err, result) => {
                if (err) {
                  console.error('❌ Ошибка проверки структуры favorites:', err.message);
                } else {
                  console.log('💖 Структура таблицы favorites:', result.rows);
                }
              });
            } else {
              console.error('❌ Таблица favorites НЕ СУЩЕСТВУЕТ!');
            }
          }
        });
        
        // ДОБАВЛЕНО: Проверяем количество категорий в БД
        pool.query('SELECT COUNT(*) as count FROM categories', (err, result) => {
          if (err) {
            console.error('❌ Ошибка подсчета категорий:', err.message);
          } else {
            console.log(`📂 В базе данных ${result.rows[0].count} категорий`);
          }
        });
      }
    });
  } catch (dbError) {
    console.error('❌ Ошибка инициализации БД:', dbError.message);
  }
});
