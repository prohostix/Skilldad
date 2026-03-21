const crypto = require('crypto');
const PaymentSessionManager = require('./PaymentSessionManager');
const { query } = require('../../config/postgres');

jest.mock('../../config/postgres');

/**
 * Unit tests for PaymentSessionManager (PostgreSQL version)
 * 
 * Verifies session lifecycle: creation, validation, expiration, and completion.
 * mocks postgres.query for all database interactions.
 */
describe('PaymentSessionManager', () => {
    let manager;
    let mockTransactionData;

    beforeEach(() => {
        manager = new PaymentSessionManager();
        mockTransactionData = {
            transactionId: 'TXN_123',
            student: 'student123',
            course: 'course123',
            amount: 1000
        };
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('should return session data with secure ID and expiration', async () => {
            const session = await manager.createSession(mockTransactionData);
            
            expect(session.sessionId).toMatch(/^SES_[A-F0-9]{20}$/);
            expect(session.expiresAt).toBeInstanceOf(Date);
            expect(session.amount).toBe(1000);
            expect(session.transactionId).toBe('TXN_123');
        });
    });

    describe('validateSession', () => {
        it('should return session if valid and not expired', async () => {
            const expiresAt = new Date(Date.now() + 3600000);
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    session_id: 'SES_123', 
                    status: 'pending', 
                    session_expires_at: expiresAt 
                }] 
            });

            const session = await manager.validateSession('SES_123');
            expect(session.session_id).toBe('SES_123');
        });

        it('should throw error if session not found', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            await expect(manager.validateSession('SES_MISSING'))
                .rejects.toThrow('Session not found');
        });

        it('should throw error and expire session if expired', async () => {
            const expiresAt = new Date(Date.now() - 3600000);
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    session_id: 'SES_EXP', 
                    status: 'pending', 
                    session_expires_at: expiresAt 
                }] 
            });
            query.mockResolvedValueOnce({ rows: [{ id: 't1', status: 'expired' }] }); // update in expireSession

            await expect(manager.validateSession('SES_EXP'))
                .rejects.toThrow('Session has expired');
            
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE transactions SET status = 'expired'"),
                ['SES_EXP']
            );
        });

        it('should throw error if session status is not pending', async () => {
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    session_id: 'SES_SUCC', 
                    status: 'success', 
                    session_expires_at: new Date(Date.now() + 3600000) 
                }] 
            });

            await expect(manager.validateSession('SES_SUCC'))
                .rejects.toThrow('Session is success');
        });
    });

    describe('completeSession', () => {
        it('should update session status to success', async () => {
            query.mockResolvedValueOnce({ rows: [{ session_id: 'SES_123', status: 'success' }] });

            const session = await manager.completeSession('SES_123');
            expect(session.status).toBe('success');
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE transactions SET status = 'success'"),
                ['SES_123']
            );
        });

        it('should throw error if session not found during completion', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            await expect(manager.completeSession('SES_MISSING'))
                .rejects.toThrow('Session not found');
        });
    });

    describe('cleanupExpiredSessions', () => {
        it('should cleanup multiple expired sessions', async () => {
            query.mockResolvedValueOnce({ rows: [{ id: '1' }, { id: '2' }] });

            const result = await manager.cleanupExpiredSessions();
            expect(result.modifiedCount).toBe(2);
            expect(query).toHaveBeenCalledWith(expect.stringContaining("UPDATE transactions SET status = 'expired'"));
        });
    });

    describe('getStatistics', () => {
        it('should return formatted statistics', async () => {
            query.mockResolvedValueOnce({ 
                rows: [
                    { status: 'success', count: '10' },
                    { status: 'pending', count: '5' }
                ] 
            });

            const stats = await manager.getStatistics();
            expect(stats.success).toBe(10);
            expect(stats.pending).toBe(5);
            expect(stats.active).toBe(5);
            expect(stats.total).toBe(15);
        });
    });
});
