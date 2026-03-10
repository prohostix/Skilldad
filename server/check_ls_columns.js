const { connectPostgres, query } = require('./config/postgres');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    try {
        await connectPostgres();
        const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'live_sessions' ORDER BY column_name");
        res.rows.forEach(r => console.log('COL:' + r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
