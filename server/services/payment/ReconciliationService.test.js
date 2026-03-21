const ReconciliationService = require('./ReconciliationService');
const RazorpayGatewayService = require('./RazorpayGatewayService');
const { query } = require('../../config/postgres');

jest.mock('../../config/postgres');
jest.mock('./RazorpayGatewayService');

/**
 * Unit Tests for ReconciliationService (PostgreSQL version)
 * 
 * Verifies transaction matching, discrepancy detection, and summary calculations.
 */
describe('ReconciliationService', () => {
    let service;
    let mockGateway;

    beforeEach(() => {
        mockGateway = {
            fetchSettlementReport: jest.fn()
        };
        service = new ReconciliationService(mockGateway);
        jest.clearAllMocks();
    });

    describe('reconcileTransactions', () => {
        it('should match transactions and produce a summary', async () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-02');
            const userId = 'admin123';

            // 1. Mock reconciliation record creation
            query.mockResolvedValueOnce({ rows: [{ id: 'rec_123', status: 'in_progress' }] });

            // 2. Mock local payments
            query.mockResolvedValueOnce({ 
                rows: [
                    { transaction_id: 'TXN_1', amount: '1000.00', status: 'success' },
                    { transaction_id: 'TXN_2', amount: '2000.00', status: 'success' }
                ] 
            });

            // 3. Mock gateway settlements
            mockGateway.fetchSettlementReport.mockResolvedValue([
                { transactionId: 'TXN_1', amount: 1000.00, status: 'success' },
                { transactionId: 'TXN_2', amount: 2000.00, status: 'success' }
            ]);

            // 4. Mock summary update
            query.mockResolvedValueOnce({ rows: [{ id: 'rec_123', status: 'completed', matched_transactions: 2 }] });

            const result = await service.reconcileTransactions(startDate, endDate, userId);

            expect(result.matched_transactions).toBe(2);
            expect(mockGateway.fetchSettlementReport).toHaveBeenCalledWith(startDate, endDate);
        });

        it('should detect amount mismatches', async () => {
            query.mockResolvedValueOnce({ rows: [{ id: 'rec_123' }] }); // Insert
            query.mockResolvedValueOnce({ 
                rows: [{ transaction_id: 'TXN_1', amount: '1000.00', status: 'success' }] 
            }); // Local
            mockGateway.fetchSettlementReport.mockResolvedValue([
                { transactionId: 'TXN_1', amount: 950.00, status: 'success' }
            ]); // Gateway
            query.mockResolvedValueOnce({ rows: [{ status: 'resolved' }] }); // Update

            const result = await service.reconcileTransactions(new Date(), new Date(), 'u1');

            expect(JSON.parse(query.mock.calls[2][1][7])[0].type).toBe('amount_mismatch');
        });

        it('should detect missing in gateway discrepancies', async () => {
            query.mockResolvedValueOnce({ rows: [{ id: 'rec_123' }] });
            query.mockResolvedValueOnce({ 
                rows: [{ transaction_id: 'TXN_1', amount: '1000.00', status: 'success' }] 
            });
            mockGateway.fetchSettlementReport.mockResolvedValue([]);
            query.mockResolvedValueOnce({ rows: [{ status: 'resolved' }] });

            const result = await service.reconcileTransactions(new Date(), new Date(), 'u1');

            expect(JSON.parse(query.mock.calls[2][1][7])[0].type).toBe('missing_in_gateway');
        });

        it('should detect missing in system discrepancies', async () => {
            query.mockResolvedValueOnce({ rows: [{ id: 'rec_123' }] });
            query.mockResolvedValueOnce({ rows: [] });
            mockGateway.fetchSettlementReport.mockResolvedValue([
                { transactionId: 'TXN_GTW', amount: 500.00, status: 'success' }
            ]);
            query.mockResolvedValueOnce({ rows: [{ status: 'resolved' }] });

            const result = await service.reconcileTransactions(new Date(), new Date(), 'u1');

            expect(JSON.parse(query.mock.calls[2][1][7])[0].type).toBe('missing_in_system');
        });
    });

    describe('normalizeStatus', () => {
        it('should normalize various statuses correctly', () => {
            expect(service.normalizeStatus('success')).toBe('success');
            expect(service.normalizeStatus('completed')).toBe('success');
            expect(service.normalizeStatus('settled')).toBe('success');
            expect(service.normalizeStatus('failed')).toBe('failed');
            expect(service.normalizeStatus('refunded')).toBe('refunded');
            expect(service.normalizeStatus('pending')).toBe('pending');
            expect(service.normalizeStatus(null)).toBe('unknown');
        });
    });
});
