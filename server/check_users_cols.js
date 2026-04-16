require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
const fs = require('fs');

async function check() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        fs.writeFileSync('users_cols.json', JSON.stringify(res.rows, null, 2));
        console.log('Success - wrote to users_cols.json');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
