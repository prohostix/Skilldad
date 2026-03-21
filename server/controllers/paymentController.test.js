const { query } = require('../config/postgres');
const RazorpayGatewayService = require('../services/payment/RazorpayGatewayService');
const PaymentSessionManager = require('../services/payment/PaymentSessionManager');
const SecurityLogger = require('../services/payment/SecurityLogger');
const MonitoringService = require('../services/payment/MonitoringService');

jest.mock('../config/postgres');
jest.mock('../services/payment/RazorpayGatewayService');
jest.mock('../services/payment/PaymentSessionManager');
jest.mock('../services/payment/SecurityLogger');
jest.mock('../services/payment/MonitoringService');
jest.mock('../services/payment/ReceiptGeneratorService');
jest.mock('../services/payment/EmailService');

// Define shared mock instances
const mockRazorpayInstance = {
    createOrder: jest.fn().mockResolvedValue({ orderId: 'order_123' }),
    verifyPaymentSignature: jest.fn().mockReturnValue(true),
    fetchPaymentDetails: jest.fn().mockResolvedValue({ status: 'captured', method: 'upi' }),
    verifyWebhookSignature: jest.fn().mockReturnValue(true),
    initiateRefund: jest.fn().mockResolvedValue({ success: true, refund_id: 'ref_123', status: 'processed' }),
    getPublishableKey: jest.fn().mockReturnValue('test_key'),
    fetchOrderDetails: jest.fn(),
};

const mockSessionManagerInstance = {
    createSession: jest.fn().mockResolvedValue({
        sessionId: 'sess_123',
        expiresAt: new Date(Date.now() + 3600000)
    }),
    completeSession: jest.fn().mockResolvedValue(true),
};

// Apply mock implementations BEFORE requiring the controller
RazorpayGatewayService.mockImplementation(() => mockRazorpayInstance);
PaymentSessionManager.mockImplementation(() => mockSessionManagerInstance);

const paymentController = require('./paymentController');

describe('PaymentController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 'student123', role: 'student', email: 'john@example.com' },
            ip: '127.0.0.1',
            get: jest.fn((header) => header === 'user-agent' ? 'Mozilla/5.0' : null),
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            redirect: jest.fn().mockReturnThis(),
        };
        
        // Ensure the mock instances return default values for each test
        mockRazorpayInstance.createOrder.mockResolvedValue({ orderId: 'order_123' });
        mockSessionManagerInstance.createSession.mockResolvedValue({
            sessionId: 'sess_123',
            expiresAt: new Date(Date.now() + 3600000)
        });
    });

    describe('initiatePayment', () => {
        it('should return 404 when course not found', async () => {
            req.body = { courseId: 'course123' };
            query.mockResolvedValueOnce({ rows: [] }); // Course check

            await paymentController.initiatePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found' });
        });

        it('should return 400 for invalid discount code', async () => {
            req.body = { courseId: 'course123', discountCode: 'INVALID' };
            query.mockResolvedValueOnce({ rows: [{ id: 'course123', price: 1000 }] }); // Course (205)
            query.mockResolvedValueOnce({ rows: [] }); // Enrollment check (212)
            query.mockResolvedValueOnce({ rows: [{ id: 'student123', name: 'John', email: 'john@example.com' }] }); // Student (215)
            query.mockResolvedValueOnce({ rows: [] }); // Discount check (241)

            await paymentController.initiatePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or expired discount code' });
        });

        it('should initiate payment successfully', async () => {
            req.body = { courseId: 'course123' };
            query.mockResolvedValueOnce({ rows: [{ id: 'course123', title: 'Test Course', price: 1000 }] }); // Course (205)
            query.mockResolvedValueOnce({ rows: [] }); // Enrollment check (212)
            query.mockResolvedValueOnce({ rows: [{ id: 'student123', name: 'John', email: 'john@example.com' }] }); // Student (215)
            
            await paymentController.initiatePayment(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                orderId: 'order_123'
            }));
        });
    });

    describe('handleCallback', () => {
        it('should redirect to success page on successful verification', async () => {
            req.query = {
                razorpay_order_id: 'order_123',
                razorpay_payment_id: 'pay_123',
                razorpay_signature: 'sig_123'
            };

            query.mockResolvedValueOnce({ 
                rows: [{ 
                    transaction_id: 'txn_123', 
                    student_id: 'student123', 
                    course_id: 'course123',
                    final_amount: 1000,
                    course_title: 'Test Course',
                    sessionId: 'sess_123'
                }] 
            }); // Transaction find (522)
            
            await paymentController.handleCallback(req, res);

            expect(res.redirect).toHaveBeenCalled();
        });
    });

    describe('processRefund', () => {
        it('should return 403 for non-admin user', async () => {
            req.user.role = 'student';
            req.body = { transactionId: 'txn_123', amount: 500, reason: 'Ref' };

            await paymentController.processRefund(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should process refund successfully for admin', async () => {
            req.user.role = 'admin';
            req.body = { transactionId: 'txn_123', amount: 500, reason: 'Ref' };

            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 't1', 
                    transaction_id: 'txn_123', 
                    status: 'success', 
                    final_amount: 1000,
                    razorpay_payment_id: 'pay_123',
                    student_id: 'student123',
                    course_id: 'course123'
                }] 
            }); // Transaction find (979)

            await paymentController.processRefund(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
