const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkSessions = async () => {
    await connectPostgres();
    const res = await query("SELECT id, topic, course_id, created_at FROM live_sessions ORDER BY created_at DESC LIMIT 1");
    console.log(res.rows[0]);
    process.exit(0);
};

checkSessions();
