import api from './api';

// Получение всех локаций с фильтрацией и пагинацией
export const getLocations = async (filters = {}, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  
  // Добавляем параметры фильтрации
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
  // Добавляем параметры пагинации
  params.append('page', page);
  params.append('limit', limit);
  
  const response = await api.get(`/locations?${params.toString()}`);
  return response.data;
};

// Получение локации по ID
export const getLocationById = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

// Создание новой локации
export const createLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

// Обновление локации
export const updateLocation = async (id, locationData) => {
  const response = await api.put(`/locations/${id}`, locationData);
  return response.data;
};

// Удаление локации
export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

// Получение локаций пользователя
export const getUserLocations = async (userId) => {
  const response = await api.get(`/locations/user/${userId}`);
  return response.data;
};

// Получение ближайших локаций
export const getNearbyLocations = async (latitude, longitude, radius = 10) => {
  const response = await api.get('/nearby-locations', {
    params: { latitude, longitude, radius }
  });
  return response.data;
};

const locationService = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getUserLocations,
  getNearbyLocations
};

export default locationService;
