const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkIdType = async () => {
    await connectPostgres();
    const res = await query("SELECT data_type FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'id'");
    console.log(res.rows[0]);
    process.exit(0);
};

checkIdType();
