require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    const body = { code: 'SKILLDAD010', value: 10, type: 'percentage', expiryDate: '2026-02-05' };
    const id = `disc_${Date.now()}`;
    try {
        const result = await query(`
            INSERT INTO discounts (id, code, type, value, expiry_date, partner_id, active, used_count, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
            RETURNING *
        `, [id, body.code.toUpperCase(), body.type || 'percentage', body.value, body.expiryDate || null, null, true, 0]);
        console.log("Success:", JSON.stringify(result.rows[0], null, 2));
    } catch(e) {
        console.error("FAIL:", e.message);
    }
    process.exit(0);
}
run();
