import api from './api';

// Регистрация пользователя
const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  
  return response.data;
};

// Вход пользователя
const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  
  return response.data;
};

// Выход пользователя
const logout = () => {
  localStorage.removeItem('token');
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
