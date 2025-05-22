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

// Статические файлы
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

// Подключение маршрутов
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');

app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Что-то пошло не так!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);



// Импорт маршрутов
const apiRoutes = require('./routes/api');



// Использование маршрутов
app.use('/api', apiRoutes);

// Статические файлы для загруженных изображений
app.use('/uploads', express.static('uploads'));


