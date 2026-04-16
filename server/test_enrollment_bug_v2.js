require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function test() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');

        const studentId = 'user_1774262164137';
        const courseId = 'course_1774258330101'; // The one that I used before
        const adminId = 'user_1773917835158';

        console.log('[Test] Step 1: Inserting enrollment...');
        try {
            await query(`
                INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
                VALUES ($1, $2, $3, 'active', 0, NOW(), NOW())
            `, [`enr_bug_${Date.now()}`, studentId, courseId]);
            console.log('[Test] Step 1 SUCCESS');
        } catch (e1) {
            console.error('[Test] Step 1 FAILED:', e1.message);
            console.error('[Test] Full error:', e1);
        }

        console.log('[Test] Step 2: Inserting transaction...');
        try {
            const txnId = `ADM-BUG-${Date.now()}`;
            await query(`
                INSERT INTO transactions (id, student_id, course_id, final_amount, payment_method, gateway_transaction_id, status, notes, reviewed_by, reviewed_at, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
            `, [`txn_bug_${Date.now()}`, studentId, courseId, 0, 'admin_enrolled', txnId, 'completed', 'Test', adminId]);
            console.log('[Test] Step 2 SUCCESS');
        } catch (e2) {
            console.error('[Test] Step 2 FAILED:', e2.message);
            console.error('[Test] Full error:', e2);
        }

        process.exit(0);
    } catch (e) {
        console.error('[Test] CRITICAL:', e);
        process.exit(1);
    }
}
test();
