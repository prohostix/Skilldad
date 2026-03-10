const { connectPostgres, query } = require('./config/postgres');
const dotenv = require('dotenv');
dotenv.config();

async function checkTables() {
    try {
        await connectPostgres();
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%record%'");
        console.log('RECORD_TABLES:', tables.rows.map(r => r.table_name).join(', '));

        const sessions = await query("SELECT id, zoom FROM live_sessions WHERE zoom IS NOT NULL LIMIT 2");
        sessions.rows.forEach(s => {
            console.log(`SESSION: ${s.id}`);
            console.log(`ZOOM_JSON: ${JSON.stringify(s.zoom)}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTables();
