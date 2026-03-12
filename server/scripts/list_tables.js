const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const listTables = async () => {
    try {
        await connectPostgres();
        const res = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

listTables();
