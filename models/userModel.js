// models/userModel.js - УЛУЧШЕННАЯ ВЕРСИЯ
const pool = require('../db');

// Создание нового пользователя
const createUser = async (username, email, password, role = 'user') => {
  try {
    const query = 'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at';
    const values = [username, email, password, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Поиск пользователя по email (с паролем для аутентификации)
const findUserByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// ДОПОЛНЕНИЕ: Поиск пользователя по username или email
const findUserByUsernameOrEmail = async (identifier) => {
  try {
    const query = 'SELECT * FROM users WHERE username = $1 OR email = $1';
    const result = await pool.query(query, [identifier]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by username or email:', error);
    throw error;
  }
};

// Поиск пользователя по id (без пароля)
const findUserById = async (id) => {
  try {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
};

// ДОПОЛНЕНИЕ: Проверка существования пользователя
const checkUserExists = async (username, email) => {
  try {
    const query = 'SELECT id FROM users WHERE username = $1 OR email = $2';
    const result = await pool.query(query, [username, email]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// ДОПОЛНЕНИЕ: Обновление пользователя
const updateUser = async (id, updates) => {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, created_at`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ДОПОЛНЕНИЕ: Получение статистики пользователя
const getUserStats = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT l.id) as locations_count,
        COUNT(DISTINCT r.id) as reviews_count,
        COUNT(DISTINCT p.id) as photos_count
      FROM users u
      LEFT JOIN locations l ON u.id = l.created_by
      LEFT JOIN reviews r ON u.id = r.user_id
      LEFT JOIN photos p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.role, u.created_at
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsernameOrEmail,
  findUserById,
  checkUserExists,
  updateUser,
  getUserStats
};
