const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkLogs = async () => {
    await connectPostgres();
    const res = await query("SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
};

checkLogs();
