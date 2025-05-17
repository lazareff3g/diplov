const pool = require('../db'); // Используйте только один импорт

// Создание нового пользователя
const createUser = async (username, email, password, role = 'user') => {
  const query = 'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [username, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Поиск пользователя по email
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Поиск пользователя по id
const findUserById = async (id) => {
  const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
