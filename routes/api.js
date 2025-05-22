const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const photoController = require('../controllers/photoController');
const reviewController = require('../controllers/reviewController');
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth'); // Изменено: импортируем protect из auth.js
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Маршруты для локаций
router.get('/locations', locationController.getLocations);
router.get('/locations/:id', locationController.getLocationById);
router.post('/locations', protect, locationController.createLocation); // Изменено: используем protect
router.put('/locations/:id', protect, locationController.updateLocation); // Изменено: используем protect
router.delete('/locations/:id', protect, locationController.deleteLocation); // Изменено: используем protect
router.get('/nearby-locations', locationController.getNearbyLocations);

// Маршруты для фотографий
router.get('/locations/:location_id/photos', photoController.getPhotosByLocationId);
router.post('/photos', protect, upload.single('photo'), photoController.uploadPhoto); // Изменено: используем protect
router.delete('/photos/:id', protect, photoController.deletePhoto); // Изменено: используем protect

// Маршруты для отзывов
router.get('/locations/:location_id/reviews', reviewController.getReviewsByLocationId);
router.post('/reviews', protect, reviewController.addReview); // Изменено: используем protect
router.delete('/reviews/:id', protect, reviewController.deleteReview); // Изменено: используем protect

// Маршруты для избранных локаций
router.get('/favorites', protect, favoriteController.getFavorites); // Изменено: используем protect
router.post('/favorites', protect, favoriteController.addToFavorites); // Изменено: используем protect
router.delete('/favorites/:location_id', protect, favoriteController.removeFromFavorites); // Изменено: используем protect
router.get('/favorites/:location_id/check', protect, favoriteController.checkIsFavorite); // Изменено: используем protect

module.exports = router;
