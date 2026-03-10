const { query } = require('../../config/postgres');
const HDFCGatewayService = require('./HDFCGatewayService');

/**
 * ReconciliationService - Handles reconciliation between SkillDad and Payment Gateway
 * 
 * Requirements: 10.1-10.8
 */
class ReconciliationService {
  /**
   * Initialize Reconciliation Service
   * @param {Object} gatewayService - Gateway service instance (optional)
   */
  constructor(gatewayService = null) {
    this.gatewayService = gatewayService || new HDFCGatewayService();
  }

  /**
   * Normalize status from different gateways to system status
   * @param {string} status - Gateway status
   * @returns {string} System status
   */
  normalizeStatus(status) {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s === 'success' || s === 'completed' || s === 'settled') return 'success';
    if (s === 'failed' || s === 'declined' || s === 'rejected') return 'failed';
    if (s === 'refunded' || s === 'reversed') return 'refunded';
    if (s === 'pending' || s === 'processing') return 'pending';
    return s;
  }

  /**
   * Reconcile transactions between local database and gateway settlement
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @param {string} userId - User performing reconciliation
   */
  async reconcileTransactions(startDate, endDate, userId) {
    try {
      const reconciliationId = `rec_${Date.now()}`;
      const recRes = await query(`
        INSERT INTO payment_reconciliations 
        (id, reconciliation_date, start_date, end_date, performed_by, status, created_at, updated_at)
        VALUES ($1, NOW(), $2, $3, $4, 'in_progress', NOW(), NOW())
        RETURNING *
      `, [reconciliationId, startDate, endDate, userId]);

      let reconciliation = recRes.rows[0];

      try {
        // 1. Fetch local transactions for date range
        const localTransactionsRes = await query(`
          SELECT * FROM payments 
          WHERE created_at >= $1 AND created_at <= $2
        `, [startDate, endDate]);
        const localTransactions = localTransactionsRes.rows;

        // 2. Fetch settlement reports from gateway
        const settlementRecords = await this.gatewayService.fetchSettlementReport(startDate, endDate);

        // Create a map for quick lookup
        const settlementMap = new Map();
        settlementRecords.forEach(rec => {
          settlementMap.set(rec.transactionId || rec.orderId, rec);
        });

        // 3. Process matches and discrepancies
        const discrepancies = [];
        let matchedCount = 0;
        let totalSystemAmount = 0;
        let totalGatewayAmount = 0;
        let refundedAmount = 0;
        let settledAmount = 0;

        // Check local transactions against gateway
        localTransactions.forEach(txn => {
          const sysAmount = parseFloat(txn.amount);
          totalSystemAmount += sysAmount;

          const gatewayRec = settlementMap.get(txn.transaction_id || txn.order_id);

          if (!gatewayRec) {
            // Missing in gateway (if it was successful in our system)
            if (txn.status === 'success') {
              discrepancies.push({
                transactionId: txn.transaction_id || txn.order_id,
                type: 'missing_in_gateway',
                systemAmount: txn.amount,
                systemStatus: txn.status,
                description: `Transaction ${txn.transaction_id || txn.order_id} marked as success in system but missing in gateway report.`
              });
            }
          } else {
            const gtwAmount = parseFloat(gatewayRec.amount);
            const gtwStatus = this.normalizeStatus(gatewayRec.status);

            totalGatewayAmount += gtwAmount;

            // Check for amount mismatch (allow 0.01 tolerance)
            const amountDiff = Math.abs(sysAmount - gtwAmount);
            if (amountDiff > 0.01) {
              discrepancies.push({
                transactionId: txn.transaction_id || txn.order_id,
                type: 'amount_mismatch',
                systemAmount: txn.amount,
                gatewayAmount: gtwAmount,
                description: `Amount mismatch: System ₹${sysAmount.toFixed(2)}, Gateway ₹${gtwAmount.toFixed(2)}`
              });
            } else if (txn.status !== gtwStatus) {
              // Status mismatch
              discrepancies.push({
                transactionId: txn.transaction_id || txn.order_id,
                type: 'status_mismatch',
                systemStatus: txn.status,
                gatewayStatus: gtwStatus,
                description: `Status mismatch: System ${txn.status}, Gateway ${gtwStatus}`
              });
            } else {
              // Perfect match
              matchedCount++;
              if (gtwStatus === 'success') settledAmount += gtwAmount;
              if (gtwStatus === 'refunded') refundedAmount += gtwAmount;
            }

            // Remove from map to track "gateway only" transactions
            settlementMap.delete(txn.transaction_id || txn.order_id);
          }
        });

        // 4. Check for transactions only in gateway
        settlementMap.forEach((rec, txnId) => {
          discrepancies.push({
            transactionId: txnId,
            type: 'missing_in_system',
            gatewayAmount: parseFloat(rec.amount),
            gatewayStatus: this.normalizeStatus(rec.status),
            description: `Transaction ${txnId} found in gateway report but missing in SkillDad database.`
          });
        });

        // 5. Finalize reconciliation record
        const status = discrepancies.length > 0 ? 'resolved' : 'completed';
        const netSettlement = settledAmount - refundedAmount;

        const updateRes = await query(`
          UPDATE payment_reconciliations SET
            total_transactions = $1, matched_transactions = $2, unmatched_transactions = $3,
            total_amount = $4, settled_amount = $5, refunded_amount = $6, net_settlement_amount = $7,
            discrepancies = $8, status = $9, completed_at = NOW(), updated_at = NOW()
          WHERE id = $10 RETURNING *
        `, [
          localTransactions.length, matchedCount, discrepancies.length,
          totalSystemAmount, settledAmount, refundedAmount, netSettlement,
          JSON.stringify(discrepancies), status, reconciliationId
        ]);

        return updateRes.rows[0];
      } catch (error) {
        await query(`
          UPDATE payment_reconciliations SET status = 'failed', error_message = $1, updated_at = NOW()
          WHERE id = $2
        `, [error.message, reconciliationId]);
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to reconcile transactions: ${error.message}`);
    }
  }

  /**
   * Generate reconciliation report
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @param {string} format - Report format (csv/excel)
   */
  async generateReconciliationReport(startDate, endDate, format = 'csv') {
    // Placeholder: In real implementation, use exceljs or similar to generate file and upload to S3/CDN
    const filename = `reconciliation_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.${format}`;
    return `/reports/${filename}`;
  }
}

module.exports = ReconciliationService;

