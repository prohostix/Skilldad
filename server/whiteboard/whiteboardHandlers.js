'use strict';

/**
 * whiteboardHandlers.js
 * In-memory StateStore + Socket.IO event handlers for the collaborative whiteboard.
 * Registered inside SocketService's connection handler via registerWhiteboardHandlers().
 */

const { query } = require('../config/postgres');

// ── In-memory StateStore ──────────────────────────────────────────────────────
// Keyed by sessionId. Cleared when the session ends or server restarts.
const stateStore = new Map();
// stateStore[sessionId] = { strokes: [], permissions: { canStudentsDraw: true } }

const StateStore = {
  get(sessionId) {
    if (!stateStore.has(sessionId)) {
      stateStore.set(sessionId, { strokes: [], permissions: { canStudentsDraw: true } });
    }
    return stateStore.get(sessionId);
  },

  addStroke(sessionId, stroke) {
    const state = StateStore.get(sessionId);
    state.strokes.push(stroke);
  },

  removeLastStroke(sessionId, userId) {
    const state = StateStore.get(sessionId);
    // Find last stroke by this user
    for (let i = state.strokes.length - 1; i >= 0; i--) {
      if (state.strokes[i].userId === userId) {
        state.strokes.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  clear(sessionId) {
    const state = StateStore.get(sessionId);
    state.strokes = [];
  },

  setPermissions(sessionId, permissions) {
    const state = StateStore.get(sessionId);
    state.permissions = { ...state.permissions, ...permissions };
  },

  delete(sessionId) {
    stateStore.delete(sessionId);
  },
};

// ── Host verification helper ──────────────────────────────────────────────────
async function isSessionHost(userId, sessionId) {
  try {
    const result = await query(
      'SELECT instructor_id, university_id FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)',
      [sessionId]
    );
    if (!result.rows.length) return false;
    const { instructor_id, university_id } = result.rows[0];
    return (
      (instructor_id && instructor_id.toString() === userId.toString()) ||
      (university_id && university_id.toString() === userId.toString())
    );
  } catch (err) {
    console.error('[WhiteboardHandlers] Host check error:', err.message);
    return false;
  }
}

// ── Register handlers on a socket ────────────────────────────────────────────
function registerWhiteboardHandlers(socket, io) {
  const userId = socket.userId;

  // ── whiteboard:join ─────────────────────────────────────────────────────────
  socket.on('whiteboard:join', ({ sessionId }) => {
    if (!sessionId) return;
    socket.join(`whiteboard:${sessionId}`);
    const state = StateStore.get(sessionId);
    socket.emit('whiteboard:state', {
      strokes:     state.strokes,
      permissions: state.permissions,
    });
    console.log(`[Whiteboard] User ${userId} joined whiteboard:${sessionId}`);
  });

  // ── whiteboard:leave ────────────────────────────────────────────────────────
  socket.on('whiteboard:leave', ({ sessionId }) => {
    if (!sessionId) return;
    socket.leave(`whiteboard:${sessionId}`);
    console.log(`[Whiteboard] User ${userId} left whiteboard:${sessionId}`);
  });

  // ── whiteboard:stroke ───────────────────────────────────────────────────────
  socket.on('whiteboard:stroke', async ({ sessionId, stroke, userId: senderId }) => {
    if (!sessionId || !stroke) return;

    const state = StateStore.get(sessionId);

    // Permission check for students
    const host = await isSessionHost(userId, sessionId);
    if (!host && !state.permissions.canStudentsDraw) {
      console.warn(`[Whiteboard] Student ${userId} attempted stroke without permission in ${sessionId}`);
      return;
    }

    // Attach userId to stroke for undo tracking
    stroke.userId = userId;
    StateStore.addStroke(sessionId, stroke);

    // Broadcast to all OTHER clients in the room
    socket.to(`whiteboard:${sessionId}`).emit('whiteboard:stroke', { stroke, userId });
  });

  // ── whiteboard:undo ─────────────────────────────────────────────────────────
  socket.on('whiteboard:undo', ({ sessionId, userId: senderId }) => {
    if (!sessionId) return;
    StateStore.removeLastStroke(sessionId, userId);
    socket.to(`whiteboard:${sessionId}`).emit('whiteboard:undo', { userId });
  });

  // ── whiteboard:clear ────────────────────────────────────────────────────────
  socket.on('whiteboard:clear', async ({ sessionId }) => {
    if (!sessionId) return;
    const host = await isSessionHost(userId, sessionId);
    if (!host) {
      console.warn(`[Whiteboard] Non-host ${userId} attempted clear in ${sessionId}`);
      return;
    }
    StateStore.clear(sessionId);
    // Broadcast to ALL clients in the room (including sender)
    io.to(`whiteboard:${sessionId}`).emit('whiteboard:clear');
    console.log(`[Whiteboard] Board cleared by host ${userId} in ${sessionId}`);
  });

  // ── whiteboard:permission ───────────────────────────────────────────────────
  socket.on('whiteboard:permission', async ({ sessionId, canStudentsDraw }) => {
    if (!sessionId) return;
    const host = await isSessionHost(userId, sessionId);
    if (!host) {
      console.warn(`[Whiteboard] Non-host ${userId} attempted permission change in ${sessionId}`);
      return;
    }
    StateStore.setPermissions(sessionId, { canStudentsDraw: !!canStudentsDraw });
    io.to(`whiteboard:${sessionId}`).emit('whiteboard:permission', { canStudentsDraw: !!canStudentsDraw });
    console.log(`[Whiteboard] Permissions updated by host ${userId} in ${sessionId}: canStudentsDraw=${canStudentsDraw}`);
  });
}

module.exports = { registerWhiteboardHandlers, StateStore };
