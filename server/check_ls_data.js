const { connectPostgres, query } = require('./config/postgres');
const dotenv = require('dotenv');
dotenv.config();

async function checkData() {
    try {
        await connectPostgres();
        const res = await query("SELECT id, topic, zoom, zoom_meeting_id FROM live_sessions WHERE status = 'ended' LIMIT 5");
        console.log(JSON.stringify(res.rows, null, 2));

        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('TABLES:', tables.rows.map(r => r.table_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkData();
