const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkLogCols = async () => {
    await connectPostgres();
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notification_logs'");
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
};

checkLogCols();
