
require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function run() {
    try {
        await connectPostgres();
        const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'");
        console.log('COLUMNS_START');
        console.log(JSON.stringify(res.rows.map(r => r.column_name), null, 2));
        console.log('COLUMNS_END');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
