const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const updateIdType = async () => {
    await connectPostgres();
    // Use USING to convert integer to varchar
    await query("ALTER TABLE notification_logs ALTER COLUMN id TYPE VARCHAR(255) USING id::text");
    console.log("Database Schema Updated Successfully!");
    process.exit(0);
};

updateIdType();
