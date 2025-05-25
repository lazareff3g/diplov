// db.js или db/index.js - УЛУЧШЕННАЯ ВЕРСИЯ
const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'photo_locations',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // ДОБАВЛЕНИЕ: Дополнительные настройки для стабильности
  max: 20, // максимум соединений в пуле
  idleTimeoutMillis: 30000, // закрытие неактивных соединений через 30 сек
  connectionTimeoutMillis: 2000, // таймаут подключения 2 сек
});

// ИСПРАВЛЕНИЕ: Улучшенная проверка соединения
pool.on('connect', () => {
  console.log('✅ Новое соединение с PostgreSQL установлено');
});

pool.on('error', (err) => {
  console.error('❌ Неожиданная ошибка PostgreSQL:', err);
  process.exit(-1);
});

// Проверяем соединение при запуске
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔗 Успешное подключение к базе данных PostgreSQL');
    
    // ДОБАВЛЕНИЕ: Проверяем существование таблицы locations
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'locations'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Таблица locations существует');
    } else {
      console.log('⚠️ Таблица locations НЕ существует - нужно создать!');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.stack);
    console.log('🔧 Проверьте переменные окружения в .env файле');
  }
};

// Запускаем проверку при старте
testConnection();

// Функция-обертка для выполнения SQL-запросов
const query = (text, params) => {
  console.log('🔍 Выполняем SQL:', text.substring(0, 100) + '...');
  return pool.query(text, params);
};

module.exports = {
  query,
  pool
};
