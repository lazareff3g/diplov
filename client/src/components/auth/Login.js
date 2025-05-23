const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Инициализация приложения Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (только один раз)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'photo_locations',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Проверка подключения к базе данных
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.stack);
  } else {
    console.log('PostgreSQL connected:', res.rows[0]);
  }
});

// Базовый маршрут для проверки
app.get('/', (req, res) => {
  res.send('API is running');
});

// Импорт всех маршрутов
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');

// Подключение маршрутов
app.use('/api/auth', authRoutes);        // Добавлен auth маршрут
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);

// Проверяем, существует ли файл api.js, если да - подключаем
try {
  const apiRoutes = require('./routes/api');
  app.use('/api', apiRoutes);
  console.log('✅ API routes подключены');
} catch (error) {
  console.log('ℹ️ Файл routes/api.js не найден, пропускаем');
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    message: 'Что-то пошло не так!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Обработка 404 ошибок
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Locations: http://localhost:${PORT}/api/locations`);
  console.log(`   - Categories: http://localhost:${PORT}/api/categories`);
});
