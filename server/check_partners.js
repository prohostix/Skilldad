require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    const result = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'partners'");
    console.log(result.rows);
    process.exit(0);
}
run();
