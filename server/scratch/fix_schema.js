const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const fixSchema = async () => {
    await connectPostgres();
    await query("ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)");
    await query("ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS message TEXT");
    console.log("Database Schema Fixed!");
    process.exit(0);
};

fixSchema();
