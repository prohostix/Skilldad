require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
const fs = require('fs');
async function run() {
    await connectPostgres();
    try {
        const result = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'discounts'");
        fs.writeFileSync('columns.txt', result.rows.map(r => r.column_name).join('\n'));
    } catch(e) {
        fs.writeFileSync('columns.txt', `Error: ${e.message}`);
    }
    process.exit(0);
}
run();
