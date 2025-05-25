// client/src/services/authService.js
import api from './api';

// Регистрация пользователя
const register = async (userData) => {
  const response = await api.post('/auth/register', userData); // Изменен endpoint
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Сохраняем данные пользователя
    if (response.data.user && response.data.user.profile_picture) {
      localStorage.setItem('profileImage', response.data.user.profile_picture);
    }
  }
  
  return response.data;
};

// Вход пользователя
const login = async (userData) => {
  const response = await api.post('/auth/login', userData); // Изменен endpoint
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Сохраняем данные пользователя
    if (response.data.user && response.data.user.profile_picture) {
      localStorage.setItem('profileImage', response.data.user.profile_picture);
    }
  }
  
  return response.data;
};

// Выход пользователя
const logout = async () => {
  try {
    // Уведомляем сервер о выходе (опционально)
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/auth/logout');
    }
  } catch (error) {
    console.log('Ошибка при выходе с сервера:', error);
  } finally {
    // Очищаем все данные пользователя из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('userData');
    localStorage.removeItem('userID');
    
    // Удаляем заголовок авторизации
    delete api.defaults.headers.common['Authorization'];
  }
};

// Получение текущего пользователя
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/profile'); // Изменен endpoint
    
    // Обновляем изображение профиля в localStorage, если оно получено с сервера
    if (response.data && response.data.user && response.data.user.profile_picture) {
      localStorage.setItem('profileImage', response.data.user.profile_picture);
    }
    
    return response.data.user; // Возвращаем user объект
  } catch (error) {
    // Если токен недействителен, очищаем данные
    logout();
    throw error;
  }
};

// Проверка токена на сервере
const verifyToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    // Токен недействителен
    logout();
    throw error;
  }
};

// Обновление профиля
const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    
    // Обновляем изображение профиля в localStorage
    if (response.data && response.data.user && response.data.user.profile_picture) {
      localStorage.setItem('profileImage', response.data.user.profile_picture);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Смена пароля
const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Проверка, авторизован ли пользователь
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Получение токена
const getToken = () => {
  return localStorage.getItem('token');
};

// Установка токена
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,
  updateProfile,
  changePassword,
  isAuthenticated,
  getToken,
  setToken
};

export default authService;
