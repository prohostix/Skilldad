const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getMyTickets, updateTicketStatus } = require('../controllers/supportController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an Admin' });
    }
};

router.post('/', optionalProtect, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/', protect, checkAdmin, getTickets);
router.put('/:id', protect, checkAdmin, updateTicketStatus);

module.exports = router;
