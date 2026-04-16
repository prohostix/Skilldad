require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function simulate() {
    const context = {
        params: { id: 'user_1774262164137' },
        body: {
            courseId: 'course_1775208322141', // Cloud Computing
            universityId: undefined,
            note: 'Test enrollment'
        },
        user: { id: 'user_1773917835158', name: 'Admin', role: 'admin' }
    };

    try {
        await connectPostgres();
        console.log('[Simulate] PostgreSQL Connected');

        // Logic from adminController.js
        const { courseId, universityId, note } = context.body;
        const studentId = context.params.id;

        console.log(`[Simulate] Start: student=${studentId}, course=${courseId}`);

        const studentRes = await query('SELECT id, name, role, university_id, registered_by, phone, profile FROM users WHERE id = $1', [studentId]);
        const student = studentRes.rows[0];
        console.log('[Simulate] Student found:', !!student);

        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const course = courseRes.rows[0];
        console.log('[Simulate] Course found:', !!course);

        // Enrollment
        const newEnrId = `enr_sim_${Date.now()}`;
        console.log('[Simulate] Step: Inserting enrollment...');
        await query(`
            INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
            VALUES ($1, $2, $3, 'active', 0, NOW(), NOW())
        `, [newEnrId, studentId, courseId]);
        console.log('[Simulate] Enrollment inserted');

        // Progress
        console.log('[Simulate] Step: Inserting progress...');
        const progId = `prog_sim_${Date.now()}`;
        await query(`
            INSERT INTO progress (id, user_id, course_id, completed_videos, completed_exercises, project_submissions, is_completed)
            VALUES ($1, $2, $3, '[]', '[]', '[]', false)
        `, [progId, studentId, courseId]);
        console.log('[Simulate] Progress inserted');

        // Transaction
        console.log('[Simulate] Step: Inserting transaction...');
        const txnId = `ADM-SIM-${Date.now()}`;
        let partnerId = student.registered_by || student.university_id || null;
        
        // CHECK PARTNER ID EXISTS
        if (partnerId) {
            console.log('[Simulate] Validating partner_id:', partnerId);
            const partRes = await query('SELECT id FROM users WHERE id = $1', [partnerId]);
            if (partRes.rows.length === 0) {
                console.log('[Simulate] WARNING: partner_id does not exist in users table. Setting to null.');
                partnerId = null;
            }
        }

        await query(`
            INSERT INTO transactions (id, student_id, course_id, final_amount, payment_method, gateway_transaction_id, status, partner_id, notes, reviewed_by, reviewed_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
        `, [`txn_sim_${Date.now()}`, studentId, courseId, 0, 'admin_enrolled', txnId, 'completed', partnerId, note, context.user.id]);
        console.log('[Simulate] Transaction inserted');

        console.log('[Simulate] SUCCESS! Now cleaning up...');
        await query("DELETE FROM enrollments WHERE id = $1", [newEnrId]);
        await query("DELETE FROM progress WHERE id = $1", [progId]);
        await query("DELETE FROM transactions WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        console.log('[Simulate] Cleanup complete');

        process.exit(0);
    } catch (e) {
        console.error('[Simulate] CRITICAL ERROR:', e);
        process.exit(1);
    }
}
simulate();
