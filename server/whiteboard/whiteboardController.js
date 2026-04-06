'use strict';

const path = require('path');
const fs   = require('fs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/postgres');

const WHITEBOARD_DIR = path.join(__dirname, '..', 'uploads', 'whiteboards');
const MAX_PNG_BYTES  = 5 * 1024 * 1024; // 5 MB

// Ensure upload directory exists
if (!fs.existsSync(WHITEBOARD_DIR)) {
  fs.mkdirSync(WHITEBOARD_DIR, { recursive: true });
}

/**
 * POST /api/sessions/:sessionId/whiteboard/save
 * Body: { format: 'png' | 'json', data: string }
 */
const saveWhiteboardSnapshot = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format, data } = req.body;

    // Validate format
    if (!['png', 'json'].includes(format)) {
      return res.status(400).json({ message: 'Invalid format. Must be "png" or "json".' });
    }

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid data field.' });
    }

    // Size guard for PNG (base64 → bytes ≈ data.length * 0.75)
    if (format === 'png') {
      const approxBytes = Math.ceil(data.length * 0.75);
      if (approxBytes > MAX_PNG_BYTES) {
        return res.status(413).json({ message: 'PNG payload exceeds 5 MB limit.' });
      }
    }

    // Verify session exists
    const sessionResult = await query(
      'SELECT id FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)',
      [sessionId]
    );
    if (!sessionResult.rows.length) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Generate UUID filename — no user input in path
    const ext      = format === 'png' ? 'png' : 'json';
    const filename = `${uuidv4()}.${ext}`;
    const filePath = path.join(WHITEBOARD_DIR, filename);

    // Write file
    if (format === 'png') {
      const buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else {
      fs.writeFileSync(filePath, data, 'utf8');
    }

    // Relative path for DB storage
    const relPath = `uploads/whiteboards/${filename}`;

    // Insert DB record
    const insertResult = await query(
      `INSERT INTO whiteboard_snapshots (session_id, format, file_path, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [sessionId, format, relPath, req.user?.id || null]
    );

    const { id: snapshotId, created_at: createdAt } = insertResult.rows[0];

    return res.status(201).json({
      snapshotId,
      url:       `/${relPath}`,
      createdAt,
    });

  } catch (err) {
    console.error('[WhiteboardController] Save error:', err.message);
    return res.status(500).json({ message: 'Failed to save whiteboard snapshot.' });
  }
};

module.exports = { saveWhiteboardSnapshot };
