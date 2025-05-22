import api from './api';

// Регистрация пользователя
const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Сохраняем данные пользователя
    if (response.data.profile_picture) {
      localStorage.setItem('profileImage', response.data.profile_picture);
    }
  }
  
  return response.data;
};

// Вход пользователя
const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Сохраняем данные пользователя
    if (response.data.profile_picture) {
      localStorage.setItem('profileImage', response.data.profile_picture);
    }
  }
  
  return response.data;
};

// Выход пользователя
const logout = () => {
  // Очищаем все данные пользователя из localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('profileImage');
  localStorage.removeItem('userData');
  localStorage.removeItem('userID');
  
  // Удаляем заголовок авторизации
  delete api.defaults.headers.common['Authorization'];
};

// Получение текущего пользователя
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.get('/users/profile');
  
  // Обновляем изображение профиля в localStorage, если оно получено с сервера
  if (response.data && response.data.profile_picture) {
    localStorage.setItem('profileImage', response.data.profile_picture);
  }
  
  return response.data;
};

// Проверка, авторизован ли пользователь
const isAuthenticated = () => {
  return localStorage.getItem('token') ? true : false;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService;
