const crypto = require('crypto');
const { query } = require('../../config/postgres');

/**
 * PaymentSessionManager
 * 
 * Handles payment session management with secure session ID generation,
 * expiration checking, and session lifecycle operations using PostgreSQL.
 */
class PaymentSessionManager {
  constructor() {
    // Session timeout: 15 minutes (in milliseconds)
    this.sessionTimeout = 15 * 60 * 1000;
  }

  /**
   * Create session data for a new payment
   * 
   * Generates a cryptographically secure session ID and expiration time.
   * Note: The actual storage is handled by the caller (paymentController) in the transactions table.
   */
  async createSession(transactionData) {
    const sessionId = this.generateSecureSessionId();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    return {
      sessionId,
      expiresAt,
      transactionId: transactionData.transactionId,
      student: transactionData.student,
      course: transactionData.course,
      amount: transactionData.amount
    };
  }

  /**
   * Generate a cryptographically secure session ID
   */
  generateSecureSessionId() {
    const randomBytes = crypto.randomBytes(32);
    const hexString = randomBytes.toString('hex').substring(0, 20).toUpperCase();
    return `SES_${hexString}`;
  }

  /**
   * Validate a payment session
   */
  async validateSession(sessionId) {
    const result = await query(
      'SELECT * FROM transactions WHERE session_id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'pending' && session.status !== 'initiated') {
      throw new Error(`Session is ${session.status}`);
    }

    const now = new Date();
    if (now > session.session_expires_at) {
      await this.expireSession(sessionId);
      throw new Error('Session has expired');
    }

    return session;
  }

  /**
   * Expire a payment session
   */
  async expireSession(sessionId) {
    const result = await query(
      "UPDATE transactions SET status = 'expired', updated_at = NOW() WHERE session_id = $1 RETURNING *",
      [sessionId]
    );

    if (result.rows.length === 0) {
      throw new Error('Session not found');
    }

    return result.rows[0];
  }

  /**
   * Mark a session as successful (completed)
   */
  async completeSession(sessionId) {
    const result = await query(
      "UPDATE transactions SET status = 'success', completed_at = NOW(), updated_at = NOW() WHERE session_id = $1 RETURNING *",
      [sessionId]
    );

    if (result.rows.length === 0) {
      throw new Error('Session not found');
    }

    return result.rows[0];
  }

  /**
   * Cancel a payment session
   */
  async cancelSession(sessionId) {
    const result = await query(
      "UPDATE transactions SET status = 'cancelled', updated_at = NOW() WHERE session_id = $1 RETURNING *",
      [sessionId]
    );

    if (result.rows.length === 0) {
      throw new Error('Session not found');
    }

    return result.rows[0];
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    const result = await query(
      'SELECT * FROM transactions WHERE session_id = $1',
      [sessionId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get active sessions for a student
   */
  async getActiveSessionsForStudent(studentId) {
    const result = await query(
      "SELECT * FROM transactions WHERE student_id = $1 AND status = 'pending' AND session_expires_at > NOW() ORDER BY initiated_at DESC",
      [studentId]
    );
    return result.rows;
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    const result = await query(
      "UPDATE transactions SET status = 'expired', updated_at = NOW() WHERE status IN ('pending', 'initiated') AND session_expires_at < NOW() RETURNING id"
    );

    return {
      modifiedCount: result.rows.length,
      message: `Expired ${result.rows.length} sessions`
    };
  }

  /**
   * Get session statistics
   */
  async getStatistics() {
    const result = await query(
      'SELECT status, count(*) as count FROM transactions GROUP BY status'
    );

    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      expired: 0,
      cancelled: 0,
      pending: 0
    };

    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    // Alias 'pending' to 'active' for compatibility if needed
    stats.active = stats.pending;

    return stats;
  }
}

module.exports = PaymentSessionManager;
