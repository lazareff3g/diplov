import api from './api';

// Получение всех локаций с фильтрацией
export const getLocations = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  
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

const locationService = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};

export default locationService;
