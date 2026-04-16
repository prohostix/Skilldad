require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    try {
        const result = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'discounts'");
        console.log("Columns:", JSON.stringify(result.rows));
    } catch(e) {
        console.error("Error checking schema:", e.message);
    }
    process.exit(0);
}
run();
