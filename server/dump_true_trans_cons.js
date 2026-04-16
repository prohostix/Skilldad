require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
const fs = require('fs');

async function check() {
    try {
        await connectPostgres();
        const res = await query(`
            SELECT 
                conname AS constraint_name,
                pg_class.relname AS table_name,
                pg_get_constraintdef(pg_constraint.oid) AS definition
            FROM pg_constraint
            JOIN pg_class ON pg_class.oid = pg_constraint.conrelid
            WHERE pg_class.relname = 'transactions';
        `);
        const output = res.rows.map(row => `${row.table_name}.${row.constraint_name}: ${row.definition}`).join('\n');
        fs.writeFileSync('true_trans_constraints.txt', output);
        console.log('Success - wrote true_trans_constraints.txt');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
