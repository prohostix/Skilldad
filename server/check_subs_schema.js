const { connectPostgres, query } = require('./config/postgres');
require('dotenv').config();
const fs = require('fs');

async function checkSubmissionsSchema() {
    try {
        await connectPostgres();
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exam_submissions_new'");
        const columns = res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', ');
        fs.writeFileSync('subs_schema.txt', columns, 'utf-8');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkSubmissionsSchema();
