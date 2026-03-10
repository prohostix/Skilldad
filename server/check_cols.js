require('dotenv').config();
const { query, connectPostgres } = require('./config/postgres');
async function check() {
    await connectPostgres();
    const r = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'exams'");
    console.log('COLUMNS:', r.rows.map(c => c.column_name));
    process.exit();
}
check();
