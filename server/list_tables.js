require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(result.rows.map(r => r.table_name));
    process.exit(0);
}
run();
