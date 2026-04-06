'use strict';

const express = require('express');
const router  = express.Router();

const { saveWhiteboardSnapshot } = require('./whiteboardController');
const { protect, authorize }     = require('../middleware/authMiddleware');

/**
 * POST /api/sessions/:sessionId/whiteboard/save
 * Saves a whiteboard snapshot (PNG or JSON) for a live session.
 * Accessible by university, admin, and student roles.
 */
router.post(
  '/:sessionId/whiteboard/save',
  protect,
  authorize('university', 'admin', 'student'),
  saveWhiteboardSnapshot
);

module.exports = router;
