require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function run() {
    try {
        await connectPostgres();
        const res = await query("SELECT id, name, email FROM users WHERE name ILIKE '%sdfgh%' OR email ILIKE '%sdfgh%'");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
