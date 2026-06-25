require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const result = await query("SELECT id, name, university_id FROM users WHERE name ILIKE '%rinsna%' OR name ILIKE '%nidha%'");
        console.log('Student University IDs:');
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
