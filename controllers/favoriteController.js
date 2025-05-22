const favoriteModel = require('../models/favoriteModel');

// Добавление локации в избранное
exports.addToFavorites = async (req, res) => {
  try {
    const { location_id } = req.body;
    
    if (!location_id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }
    
    const result = await favoriteModel.addToFavorites(req.user.id, location_id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
};

// Удаление локации из избранного
exports.removeFromFavorites = async (req, res) => {
  try {
    const { location_id } = req.params;
    
    const result = await favoriteModel.removeFromFavorites(req.user.id, location_id);
    res.json(result);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
};

// Получение избранных локаций пользователя
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.getFavoritesByUserId(req.user.id);
    res.json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
};

// Проверка, находится ли локация в избранном у пользователя
exports.checkIsFavorite = async (req, res) => {
  try {
    const { location_id } = req.params;
    const isFavorite = await favoriteModel.checkIsFavorite(req.user.id, location_id);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
};
