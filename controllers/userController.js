const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // Добавляем импорт пула подключений

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверка наличия всех полей
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создание пользователя
    const user = await userModel.createUser(username, email, hashedPassword);
    
    // Генерация токена
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверка наличия email и пароля
    if (!email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
    }
    
    // Поиск пользователя по email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Получаем URL изображения профиля
    const profileImage = await pool.query(
      'SELECT url FROM profile_images WHERE user_id = $1',
      [user.id]
    );
    
    const imageUrl = profileImage.rows.length > 0 ? profileImage.rows[0].url : null;
    
    // Генерация токена
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile_picture: imageUrl, // Добавляем URL изображения профиля
      token
    });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Получаем URL изображения профиля
    const profileImage = await pool.query(
      'SELECT url FROM profile_images WHERE user_id = $1',
      [req.user.id]
    );
    
    const imageUrl = profileImage.rows.length > 0 ? profileImage.rows[0].url : null;
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile_picture: imageUrl // Добавляем URL изображения профиля
    });
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ error: err.message });
  }
};

// Добавляем функцию обновления профиля
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Обновляем данные пользователя
    const updatedUser = await userModel.updateUser(req.user.id, username, email);
    
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      message: 'Профиль успешно обновлен'
    });
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ error: err.message });
  }
};
