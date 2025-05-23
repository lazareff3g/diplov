const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations
} = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

// ВАЖНО: Маршрут /nearby должен быть ПЕРЕД /:id
router.get('/nearby', getNearbyLocations);

// Публичные маршруты
router.get('/', getLocations);
router.get('/:id', getLocationById);

// Защищенные маршруты (требуют аутентификации)
router.post('/', protect, createLocation);
router.put('/:id', protect, updateLocation);
router.delete('/:id', protect, deleteLocation);

module.exports = router;
