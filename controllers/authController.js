// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Генерация JWT токена
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Регистрация пользователя
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Валидация входных данных
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать не менее 6 символов' 
      });
    }

    // ДОБАВЛЕНИЕ: Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Некорректный формат email' 
      });
    }

    // ДОБАВЛЕНИЕ: Username валидация (только буквы, цифры, подчеркивания)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        message: 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, подчеркивания)' 
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await userModel.checkUserExists(username, email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким именем или email уже существует' 
      });
    }

    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const newUser = await userModel.createUser(username, email, hashedPassword);

    // Генерируем токен
    const token = generateToken(newUser);

    // УЛУЧШЕНИЕ: Логирование успешной регистрации
    console.log(`✅ Новый пользователь зарегистрирован: ${username} (${email})`);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при регистрации' 
    });
  }
};

// Вход пользователя
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier может быть username или email

    // Валидация входных данных
    if (!identifier || !password) {
      return res.status(400).json({ 
        message: 'Логин и пароль обязательны для заполнения' 
      });
    }

    // ДОБАВЛЕНИЕ: Trim пробелы
    const cleanIdentifier = identifier.trim();

    // Ищем пользователя по username или email
    const user = await userModel.findUserByUsernameOrEmail(cleanIdentifier);
    if (!user) {
      // УЛУЧШЕНИЕ: Логирование неудачных попыток входа
      console.log(`❌ Неудачная попытка входа: ${cleanIdentifier}`);
      return res.status(401).json({ 
        message: 'Неверный логин или пароль' 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Неверный пароль для пользователя: ${user.username}`);
      return res.status(401).json({ 
        message: 'Неверный логин или пароль' 
      });
    }

    // Генерируем токен
    const token = generateToken(user);

    // УЛУЧШЕНИЕ: Логирование успешного входа
    console.log(`✅ Успешный вход пользователя: ${user.username}`);

    res.status(200).json({
      message: 'Успешный вход в систему',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при входе' 
    });
  }
};

// Получение профиля текущего пользователя
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем статистику пользователя
    const userStats = await userModel.getUserStats(userId);
    
    if (!userStats) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.status(200).json({
      user: userStats
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при получении профиля' 
    });
  }
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // Валидация
    if (!username && !email) {
      return res.status(400).json({ 
        message: 'Необходимо указать данные для обновления' 
      });
    }

    // ДОБАВЛЕНИЕ: Валидация email при обновлении
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Некорректный формат email' 
        });
      }
    }

    // ДОБАВЛЕНИЕ: Валидация username при обновлении
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ 
          message: 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, подчеркивания)' 
        });
      }
    }

    // Проверяем уникальность username/email
    if (username || email) {
      const existingUser = await userModel.checkUserExists(
        username || req.user.username, 
        email || req.user.email
      );
      
      if (existingUser) {
        const existingUserData = await userModel.findUserByUsernameOrEmail(username || email);
        if (existingUserData && existingUserData.id !== userId) {
          return res.status(400).json({ 
            message: 'Пользователь с таким именем или email уже существует' 
          });
        }
      }
    }

    // Обновляем пользователя
    const updates = {};
    if (username) updates.username = username.trim();
    if (email) updates.email = email.trim().toLowerCase();

    const updatedUser = await userModel.updateUser(userId, updates);

    // УЛУЧШЕНИЕ: Логирование обновления профиля
    console.log(`✅ Профиль обновлен для пользователя: ${req.user.username}`);

    res.status(200).json({
      message: 'Профиль успешно обновлен',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении профиля' 
    });
  }
};

// Проверка токена
exports.verifyToken = async (req, res) => {
  try {
    // Если middleware protect прошел успешно, значит токен валидный
    res.status(200).json({
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при проверке токена' 
    });
  }
};

// ДОБАВЛЕНИЕ: Смена пароля
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Валидация
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Текущий пароль и новый пароль обязательны' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Новый пароль должен содержать не менее 6 символов' 
      });
    }

    // Получаем пользователя с паролем
    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    // Получаем полные данные пользователя включая пароль
    const userWithPassword = await userModel.findUserByUsernameOrEmail(user.username);

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        message: 'Неверный текущий пароль' 
      });
    }

    // Хешируем новый пароль
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль
    await userModel.updateUser(userId, { password: hashedNewPassword });

    console.log(`✅ Пароль изменен для пользователя: ${user.username}`);

    res.status(200).json({
      message: 'Пароль успешно изменен'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при смене пароля' 
    });
  }
};
