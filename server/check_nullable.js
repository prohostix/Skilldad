require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
async function run() {
    await connectPostgres();
    const result = await query(`
        SELECT column_name, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'discounts'
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
}
run();
