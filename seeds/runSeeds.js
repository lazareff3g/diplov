// seeds/runSeeds.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runSeeds() {
  try {
    console.log('🌱 Запуск seed данных...');
    
    // Читаем SQL файл
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seedData.sql'), 'utf8');
    
    // Выполняем SQL
    await pool.query(seedSQL);
    
    console.log('✅ Seed данные успешно загружены!');
    
    // Проверяем результат
    const result = await pool.query('SELECT COUNT(*) FROM locations');
    console.log(`📍 Добавлено локаций: ${result.rows[0].count}`);
    
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
    console.log(`📂 Добавлено категорий: ${categoriesResult.rows[0].count}`);
    
    const tagsResult = await pool.query('SELECT COUNT(*) FROM tags');
    console.log(`🏷️ Добавлено тегов: ${tagsResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке seed данных:', error);
  } finally {
    await pool.end();
  }
}

runSeeds();
