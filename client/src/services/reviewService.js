import api from './api';

const reviewService = {
  // Получение отзывов для конкретной локации
  getReviewsByLocationId: async (locationId) => {
    const response = await api.get(`/locations/${locationId}/reviews`);
    return response.data;
  },
  
  // Добавление нового отзыва
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  // Обновление существующего отзыва
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },
  
  // Удаление отзыва
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

export default reviewService;
