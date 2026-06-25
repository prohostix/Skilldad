const dotenv = require('dotenv');
const path = require('path');
const { connectPostgres, query } = require('../config/postgres');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const checkData = async () => {
    try {
        await connectPostgres();
        
        console.log('--- Absolute Latest Enrollments ---');
        const enrolls = await query("SELECT e.student_id, u.name, e.course_id, e.progress, e.created_at FROM enrollments e JOIN users u ON e.student_id = u.id ORDER BY e.created_at DESC LIMIT 5");
        console.table(enrolls.rows);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
