require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function test() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');

        // Student Rinsna: user_1774262164137
        // Course Cloud Computing: course_1774258330101
        const studentId = 'user_1774262164137';
        const courseId = 'course_1774258330101';
        const adminId = 'user_1773917835158'; // Sample admin ID from previous contexts
        const adminName = 'Admin';

        console.log('[Test] Starting enrollment simulation...');

        const studentRes = await query('SELECT * FROM users WHERE id = $1', [studentId]);
        const student = studentRes.rows[0];
        console.log('[Test] Student:', student ? student.name : 'NOT FOUND');

        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const course = courseRes.rows[0];
        console.log('[Test] Course:', course ? course.title : 'NOT FOUND');

        const newEnrollmentId = `enr_test_${Date.now()}`;
        console.log('[Test] Inserting enrollment...');
        await query(`
            INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
            VALUES ($1, $2, $3, 'active', 0, NOW(), NOW())
        `, [newEnrollmentId, studentId, courseId]);

        const txnId = `ADM-TEST-${Date.now()}`;
        console.log('[Test] Inserting transaction...');
        await query(`
            INSERT INTO transactions (id, student_id, course_id, final_amount, payment_method, gateway_transaction_id, status, notes, reviewed_by, reviewed_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
        `, [`txn_test_${Date.now()}`, studentId, courseId, 0, 'admin_enrolled', txnId, 'completed', 'Test admin enrollment', adminId]);

        console.log('[Test] SUCCESS');
        
        // CLEANUP
        console.log('[Test] Cleaning up...');
        await query("DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        await query("DELETE FROM transactions WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        console.log('[Test] Cleanup complete');

        process.exit(0);
    } catch (e) {
        console.error('[Test] FAILED:', e);
        process.exit(1);
    }
}
test();
