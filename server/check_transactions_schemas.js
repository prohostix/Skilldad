require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const res = await query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'transactions'");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
