/**
 * Payment Routes Integration Tests (PostgreSQL version)
 * 
 * Tests the complete payment flow end-to-end using PostgreSQL and Razorpay mocks.
 * Removes all legacy Mongoose and MongoDB dependencies.
 */

// Import setup which mocks Redis, Email, Socket, Monitoring
require('./setup');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/postgres');
const RazorpayGatewayService = require('../../services/payment/RazorpayGatewayService');

// Mock dependencies
jest.mock('../../config/postgres');
jest.mock('../../services/payment/RazorpayGatewayService');

// Import routes
const paymentRoutes = require('../paymentRoutes');

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.RAZORPAY_KEY_ID = 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use('/api/payment', paymentRoutes);
  
  // Basic error handler to catch and log 500s
  app.use((err, req, res, next) => {
    console.error('TEST_APP_INTERNAL_ERROR:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  });
  
  return app;
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Payment Routes Integration Tests', () => {
  let app;
  let authToken;
  let mockUser;
  let mockCourse;
  // Valid transaction ID: TXN_ + 10 chars = TXN_1234567890
  const validTxnId = 'TXN_1234567890';

  beforeEach(() => {
    console.error = (...args) => process.stderr.write(args.map(a => a instanceof Error ? a.stack : (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ') + '\n');
    app = createTestApp();
    mockUser = { id: 'u123', name: 'Test Student', email: 'student@example.com', role: 'student' };
    mockCourse = { id: 'c123', title: 'Test Course', price: 10000 };
    authToken = generateToken(mockUser.id);
    jest.clearAllMocks();
    
    // Default auth and entity mock
    query.mockImplementation((sql, params) => {
        const s = sql.toLowerCase();
        
        // Full mock transaction for callbacks/webhooks/status
        const mockTxn = { 
            id: 't123', 
            transaction_id: validTxnId, 
            status: 'pending', 
            student_id: 'u123',
            course_id: 'c123',
            final_amount: '10000.00',
            original_amount: '10000.00',
            discount_amount: '0.00',
            gst_amount: '1800.00',
            currency: 'INR',
            gateway_transaction_id: 'order_123',
            session_id: 'ses_123',
            sessionId: 'ses_123', // Alias used in handleCallback
            student_name: 'Test Student',
            student_email: 'student@example.com',
            course_title: 'Test Course',
            receipt_url: 'http://receipt.com/123',
            receiptUrl: 'http://receipt.com/123', // Used in some helpers
            receipt_number: 'REC-001',
            payment_method: 'upi',
            retryCount: 0
        };

        if (s.includes('from users')) return Promise.resolve({ rows: [mockUser] });
        if (s.includes('from courses')) return Promise.resolve({ rows: [mockCourse] });
        if (s.includes('from enrollments')) return Promise.resolve({ rows: [] });
        if (s.includes('insert into transactions')) return Promise.resolve({ rows: [{ id: 't123', transaction_id: validTxnId }] });
        if (s.includes('update transactions')) return Promise.resolve({ rows: [mockTxn], rowCount: 1 });
        if (s.includes('from transactions')) return Promise.resolve({ rows: [mockTxn] });
        return Promise.resolve({ rows: [] });
    });

    // Mock Razorpay instance methods on prototype
    RazorpayGatewayService.prototype.verifyPaymentSignature = jest.fn().mockReturnValue(true);
    RazorpayGatewayService.prototype.verifyWebhookSignature = jest.fn().mockReturnValue(true);
    RazorpayGatewayService.prototype.fetchPaymentDetails = jest.fn().mockResolvedValue({ 
        status: 'captured', 
        method: 'upi' 
    });
    RazorpayGatewayService.prototype.fetchOrderDetails = jest.fn().mockResolvedValue({
        status: 'paid'
    });
    RazorpayGatewayService.prototype.createOrder = jest.fn().mockResolvedValue({ 
        orderId: 'order_123', amount: 10000, currency: 'INR' 
    });
  });

  describe('POST /api/payment/initiate', () => {
    it('should successfully initiate payment', async () => {
      const response = await request(app)
        .post('/api/payment/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ courseId: 'c123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/payment/callback', () => {
    it('should redirect on successful payment callback', async () => {
      const response = await request(app)
        .get('/api/payment/callback')
        .query({
          razorpay_payment_id: 'pay_123',
          razorpay_order_id: 'order_123',
          razorpay_signature: 'sig_123',
          transactionId: validTxnId
        });

      if (response.status === 500) console.log('CALLBACK ERROR:', response.body);
      expect(response.status).toBe(302);
    });
  });

  describe('POST /api/payment/webhook', () => {
    it('should process webhook event', async () => {
        const response = await request(app)
            .post('/api/payment/webhook')
            .set('x-razorpay-signature', 'sig_123')
            .send({
                event: 'payment.captured',
                payload: {
                    payment: {
                        entity: {
                            order_id: 'order_123',
                            id: 'pay_123',
                            notes: { transactionId: validTxnId }
                        }
                    }
                }
            });

        if (response.status === 500) console.log('WEBHOOK ERROR:', response.body);
        expect(response.status).toBe(200);
    });
  });

  describe('GET /api/payment/status/:transactionId', () => {
    it('should return payment status', async () => {
      const response = await request(app)
        .get(`/api/payment/status/${validTxnId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transaction.status).toBeDefined();
    });
  });

  describe('GET /api/payment/receipt/:transactionId', () => {
      it('should return receipt details', async () => {
          const response = await request(app)
            .get(`/api/payment/receipt/${validTxnId}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect(response.status).toBe(200);
          expect(response.body.receiptUrl).toBeDefined();
      });
  });
});
