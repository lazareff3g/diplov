const photoModel = require('../models/photoModel');
const path = require('path');
const fs = require('fs');

// Загрузка фотографии для локации
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { location_id, description } = req.body;
    
    if (!location_id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }
    
    // Предполагается, что файл загружается с помощью multer
    const photoData = {
      location_id,
      url: `/uploads/${req.file.filename}`,
      description: description || '',
      user_id: req.user.id
    };
    
    const photo = await photoModel.addPhotoToLocation(photoData);
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// Получение фотографий для локации
exports.getPhotosByLocationId = async (req, res) => {
  try {
    const { location_id } = req.params;
    const photos = await photoModel.getPhotosByLocationId(location_id);
    res.json(photos);
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ error: 'Failed to retrieve photos' });
  }
};

// Удаление фотографии
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await photoModel.deletePhoto(id, req.user.id);
    
    if (!result.success) {
      return res.status(403).json({ error: result.message });
    }
    
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};
