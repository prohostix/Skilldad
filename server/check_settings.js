require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const result = await query("SELECT * FROM platform_settings");
        console.log('Platform Settings:');
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
