const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkLatestSessionUniv = async () => {
    await connectPostgres();
    const res = await query("SELECT university_id FROM live_sessions ORDER BY created_at DESC LIMIT 1");
    console.log(res.rows[0]);
    process.exit(0);
};

checkLatestSessionUniv();
