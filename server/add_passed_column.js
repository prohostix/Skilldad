const { connectPostgres, query } = require('./config/postgres');
require('dotenv').config();

async function addPassedColumn() {
    try {
        await connectPostgres();
        await query("ALTER TABLE exam_submissions_new ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false");
        console.log('Successfully added passed column.');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
addPassedColumn();
