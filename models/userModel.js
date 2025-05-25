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

// Поиск пользователя по username или email
const findUserByUsernameOrEmail = async (identifier) => {
  try {
    // УЛУЧШЕНИЕ: Приводим к нижнему регистру для email
    const cleanIdentifier = identifier.trim();
    const query = 'SELECT * FROM users WHERE username = $1 OR LOWER(email) = LOWER($1)';
    const result = await pool.query(query, [cleanIdentifier]);
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

// УЛУЧШЕНИЕ: Поиск пользователя по id с паролем (для смены пароля)
const findUserByIdWithPassword = async (id) => {
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by id with password:', error);
    throw error;
  }
};

// Проверка существования пользователя
const checkUserExists = async (username, email) => {
  try {
    // УЛУЧШЕНИЕ: Более точная проверка с учетом регистра email
    const query = 'SELECT id FROM users WHERE username = $1 OR LOWER(email) = LOWER($2)';
    const result = await pool.query(query, [username, email]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// Обновление пользователя
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
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, username, email, role, created_at`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Получение статистики пользователя
const getUserStats = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COALESCE(COUNT(DISTINCT l.id), 0) as locations_count,
        COALESCE(COUNT(DISTINCT r.id), 0) as reviews_count,
        COALESCE(COUNT(DISTINCT p.id), 0) as photos_count
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

// ДОПОЛНЕНИЕ: Получение всех пользователей (для админки)
const getAllUsers = async (limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT l.id) as locations_count
      FROM users u
      LEFT JOIN locations l ON u.id = l.created_by
      GROUP BY u.id, u.username, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// ДОПОЛНЕНИЕ: Удаление пользователя (мягкое удаление)
const deleteUser = async (id) => {
  try {
    const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsernameOrEmail,
  findUserById,
  findUserByIdWithPassword,
  checkUserExists,
  updateUser,
  getUserStats,
  getAllUsers,
  deleteUser
};
