require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function fix() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        const res = await query("UPDATE users SET university_id = 'user_1773224439154' WHERE id = 'user_1774262164137'");
        console.log('Fixed Rinsna university assignment:', res.rowCount, 'row(s) updated');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
