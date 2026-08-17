const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes - accessible without authentication
router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrandById);

// Protected routes - require authentication
router.post('/', authMiddleware, brandController.createBrand);
router.put('/:id', authMiddleware, brandController.updateBrand);
router.delete('/:id', authMiddleware, brandController.deleteBrand);

module.exports = router;
