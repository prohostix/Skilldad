require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const res = await query(`
            SELECT 
                conname AS constraint_name, 
                pg_get_constraintdef(c.oid) AS definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'transactions'::regclass;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
