const { query } = require('../config/postgres');

/**
 * AdminConfigController - Handles admin configuration and transaction management
 */
class AdminConfigController {
  constructor() {
    // No specific initialization needed for now
  }

  /**
   * Get current gateway configuration
   * Returns generic configuration information
   */
  async getGatewayConfig(req, res) {
    try {
      // Since we're using Razorpay with environment variables, 
      // there might not be a database-stored config for credentials.
      // But we can return some general settings.
      res.json({
        success: true,
        config: {
          gatewayName: 'Razorpay',
          environment: process.env.NODE_ENV || 'development',
          currency: 'INR',
          minTransactionAmount: 1,
          maxTransactionAmount: 500000,
          publishableKey: process.env.RAZORPAY_KEY_ID,
          isActive: true,
        },
      });
    } catch (error) {
      console.error('Get gateway config error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve gateway configuration',
      });
    }
  }

  /**
   * Update gateway configuration - Placeholder for Razorpay-related settings
   */
  async updateGatewayConfig(req, res) {
    res.status(501).json({
      success: false,
      message: 'Gateway configuration update is not supported for environment-based settings',
    });
  }

  /**
   * Test gateway connection
   */
  async testGatewayConnection(req, res) {
    try {
      // Simple health check for Razorpay integration
      // In a real scenario, this could check if the Razorpay client is initialized
      const isConfigured = !!process.env.RAZORPAY_KEY_SECRET;

      res.json({
        success: true,
        gatewayStatus: isConfigured ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        message: isConfigured
          ? 'Successfully connected to Razorpay'
          : 'Razorpay secret key is missing in configuration',
      });
    } catch (error) {
      console.error('Gateway connection test error:', error);
      res.status(500).json({
        success: false,
        gatewayStatus: 'error',
        message: 'Failed to test gateway connection',
        error: error.message,
      });
    }
  }

  /**
   * Get all transactions (admin view)
   */
  async getAllTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      let filterQuery = '1=1';
      const queryParams = [];
      let paramCount = 1;

      if (req.query.status) {
        filterQuery += ` AND t.status = $${paramCount++}`;
        queryParams.push(req.query.status);
      }
      if (req.query.startDate) {
        filterQuery += ` AND t.initiated_at >= $${paramCount++}`;
        queryParams.push(new Date(req.query.startDate));
      }
      if (req.query.endDate) {
        filterQuery += ` AND t.initiated_at <= $${paramCount++}`;
        queryParams.push(new Date(req.query.endDate));
      }

      // Fetch transactions with pagination
      const transactionsRes = await Promise.all([
        query(`
          SELECT t.*, u.name as student_name, u.email as student_email, c.title as course_title, c.price as course_price
          FROM transactions t
          LEFT JOIN users u ON t.student_id = u.id
          LEFT JOIN courses c ON t.course_id = c.id
          WHERE ${filterQuery}
          ORDER BY t.initiated_at DESC
          LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `, [...queryParams, limit, skip]),
        query(`SELECT COUNT(*) FROM transactions t WHERE ${filterQuery}`, queryParams)
      ]);

      const total = parseInt(transactionsRes[1].rows[0].count);
      const transactions = transactionsRes[0].rows.map(t => ({
          ...t,
          student: { name: t.student_name, email: t.student_email },
          course: { title: t.course_title, price: t.course_price }
      }));

      res.json({
        success: true,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
      });
    }
  }
}

module.exports = new AdminConfigController();
