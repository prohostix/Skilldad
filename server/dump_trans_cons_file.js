require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
const fs = require('fs');

async function check() {
    try {
        await connectPostgres();
        const res = await query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'transactions'::regclass;
        `);
        const output = res.rows.map(row => `${row.conname}: ${row.pg_get_constraintdef}`).join('\n');
        fs.writeFileSync('trans_constraints_output.txt', output);
        console.log('Success - wrote trans_constraints_output.txt');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
