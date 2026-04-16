require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    try {
        const result = await query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'documents'");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.log(e.message);
    }
    process.exit(0);
}
run();
