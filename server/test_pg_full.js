require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    try {
        const id = require('uuid').v4();
        await query("INSERT INTO discounts (id, code, type, value, active, created_at) VALUES ($1, $2, $3, $4, $5, NOW())", 
            [id, 'TEST_COUPON', 'percentage', 10, true]);
        console.log("Insert success!");
        const result = await query("SELECT * FROM discounts");
        console.log("Rows:", result.rows.length);
        // Clean up
        await query("DELETE FROM discounts WHERE id = $1", [id]);
        console.log("Cleanup success!");
    } catch(e) {
        console.error("Test failed:", e.message);
    }
    process.exit(0);
}
run();
