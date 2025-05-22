import api from './api';

const favoriteService = {
  // Получение всех избранных локаций пользователя
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },
  
  // Добавление локации в избранное
  addToFavorites: async (locationId) => {
    const response = await api.post('/favorites', { location_id: locationId });
    return response.data;
  },
  
  // Удаление локации из избранного
  removeFromFavorites: async (locationId) => {
    const response = await api.delete(`/favorites/${locationId}`);
    return response.data;
  },
  
  // Проверка, находится ли локация в избранном
  checkIsFavorite: async (locationId) => {
    const response = await api.get(`/favorites/${locationId}/check`);
    return response.data;
  }
};

export default favoriteService;
