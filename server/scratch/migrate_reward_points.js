const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectPostgres, query } = require('../config/postgres');

async function migrate() {
    try {
        console.log('Connecting to DB...');
        await connectPostgres();
        
        console.log('Adding reference_name column to reward_points...');
        await query(`
            ALTER TABLE reward_points 
            ADD COLUMN IF NOT EXISTS reference_name TEXT
        `);
        console.log('Column added successfully.');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
