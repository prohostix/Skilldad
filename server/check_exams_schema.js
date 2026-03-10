const { connectPostgres, query } = require('./config/postgres');
require('dotenv').config();
const fs = require('fs');

async function checkExamsSchema() {
    try {
        await connectPostgres();
        const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'exams'");
        const columns = res.rows.map(r => r.column_name).join(', ');
        fs.writeFileSync('exams_schema.txt', columns, 'utf-8');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkExamsSchema();
