const express = require('express');
const router = express.Router();
const {
    getServices,
    getAdminServices,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an Admin' });
    }
};

// Public routes
router.get('/', getServices);

// Admin routes
router.get('/admin', protect, checkAdmin, getAdminServices);
router.post('/', protect, checkAdmin, createService);
router.put('/:id', protect, checkAdmin, updateService);
router.delete('/:id', protect, checkAdmin, deleteService);

module.exports = router;
