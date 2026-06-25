const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkEnrollments = async () => {
    await connectPostgres();
    const res = await query("SELECT e.course_id, c.title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = 'user_1774262164137'");
    console.log(res.rows);
    process.exit(0);
};

checkEnrollments();
