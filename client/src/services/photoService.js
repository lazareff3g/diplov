import api from './api';

const photoService = {
  // Получение фотографий для конкретной локации
  getPhotosByLocationId: async (locationId) => {
    const response = await api.get(`/locations/${locationId}/photos`);
    return response.data;
  },
  
  // Загрузка новой фотографии
  uploadPhoto: async (formData) => {
    const response = await api.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Удаление фотографии
  deletePhoto: async (photoId) => {
    const response = await api.delete(`/photos/${photoId}`);
    return response.data;
  }
};

export default photoService;
