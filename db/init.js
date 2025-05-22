// db/init.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  try {
    // Подключаемся к базе данных
    const client = await pool.connect();
    console.log('Connected to the database');

    // Создаем таблицы
    await client.query(`
      -- Таблица пользователей
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица категорий
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT
      );

      -- Таблица локаций
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        category_id INTEGER REFERENCES categories(id),
        created_by INTEGER REFERENCES users(id),
        best_time_of_day VARCHAR(20),
        best_season VARCHAR(20),
        accessibility VARCHAR(50),
        permission_required BOOLEAN DEFAULT FALSE,
        difficulty_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица избранных локаций
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        location_id INTEGER REFERENCES locations(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, location_id)
      );

      -- Таблица отзывов
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        location_id INTEGER REFERENCES locations(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, location_id)
      );

      -- Таблица фотографий
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        user_id INTEGER REFERENCES users(id),
        url VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица профильных изображений
      CREATE TABLE IF NOT EXISTS profile_images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Добавляем базовые категории
    await client.query(`
      INSERT INTO categories (name, description)
      VALUES 
        ('Заброшенные здания', 'Старые, неиспользуемые здания и сооружения'),
        ('Природные локации', 'Живописные природные места'),
        ('Городские объекты', 'Интересные места в городской среде'),
        ('Исторические места', 'Места с исторической ценностью'),
        ('Индустриальные объекты', 'Промышленные зоны и объекты')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('Database tables created successfully');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Закрываем пул соединений
    await pool.end();
    console.log('Database connection pool closed');
  }
};

createTables();
