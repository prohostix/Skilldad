const dotenv = require('dotenv');
const path = require('path');
const { connectPostgres, query } = require('../config/postgres');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const forceReady = async () => {
    try {
        await connectPostgres();
        
        // Target student: Rinsna
        const studentId = 'user_1774262164137';
        
        // Find an enrollment for her
        const enrollRes = await query('SELECT course_id FROM enrollments WHERE student_id = $1 LIMIT 1', [studentId]);
        
        if (enrollRes.rows.length === 0) {
            console.log('No enrollments found for Rinsna.');
            process.exit(0);
        }

        const courseId = enrollRes.rows[0].course_id;
        
        // Force 100% progress
        await query('UPDATE enrollments SET progress = 100 WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        
        console.log(`Successfully forced 100% progress for Rinsna (${studentId}) on course ${courseId}.`);
        console.log('Now refresh the /dashboard/documents page!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to force progress:', error);
        process.exit(1);
    }
};

forceReady();
