require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    try {
        const result = await query('SELECT * FROM discounts ORDER BY created_at DESC');
        console.log("Success:", result.rows.length);
    } catch(e) {
        console.error("Error connecting to discounts:", e.message);
    }
    process.exit(0);
}
run();
