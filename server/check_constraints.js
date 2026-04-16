require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    try {
        const result = await query(`
            SELECT table_name, constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'discounts'
        `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch(e) {
        console.error(e.message);
    }
    process.exit(0);
}
run();
