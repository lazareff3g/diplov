const reviewModel = require('../models/reviewModel');

// Добавление отзыва к локации
exports.addReview = async (req, res) => {
  try {
    const { location_id, rating, comment } = req.body;
    
    if (!location_id || !rating) {
      return res.status(400).json({ error: 'Location ID and rating are required' });
    }
    
    // Проверяем, что рейтинг находится в допустимом диапазоне
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const reviewData = {
      location_id,
      user_id: req.user.id,
      rating,
      comment: comment || ''
    };
    
    const review = await reviewModel.addReview(reviewData);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

// Получение отзывов для локации
exports.getReviewsByLocationId = async (req, res) => {
  try {
    const { location_id } = req.params;
    const reviews = await reviewModel.getReviewsByLocationId(location_id);
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// Удаление отзыва
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewModel.deleteReview(id, req.user.id);
    
    if (!result.success) {
      return res.status(403).json({ error: result.message });
    }
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
