require('dotenv').config();
const { query, connectPostgres } = require('./config/postgres');
async function run() {
    await connectPostgres();
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'questions'");
    console.log(res.rows.map(r => r.column_name));
    process.exit();
}
run();
