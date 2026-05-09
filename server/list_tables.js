require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function listTables() {
    try {
        await connectPostgres();
        const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', result.rows.map(r => r.table_name));
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        process.exit();
    }
}

listTables();
