require('dotenv').config();
const { query, connectPostgres } = require('./config/postgres');
async function migrate() {
    await connectPostgres();
    try {
        await query("ALTER TABLE exams ADD COLUMN IF NOT EXISTS mandated_slot_id TEXT");
        console.log('Migration successful: added mandated_slot_id to exams');
    } catch (err) {
        console.error('Migration failed:', err);
    }
    process.exit();
}
migrate();
