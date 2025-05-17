const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Проверяем соединение с базой данных
pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
  } else {
    console.log('Успешное подключение к базе данных PostgreSQL');
    release();
  }
});

// Функция-обертка для выполнения SQL-запросов
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};
