require('dotenv').config({ path: './server/.env' });
const { getPool } = require('./server/config/postgres');

async function run() {
    const pool = getPool();
    if (!pool) {
        console.error('Database connection pool is not ready.');
        process.exit(1);
    }
    
    try {
        console.log('Adding display_order to courses table...');
        await pool.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999');
        console.log('Column added successfully.');
    } catch (err) {
        console.error('Error adding column:', err.message);
    } finally {
        process.exit(0);
    }
}

// Give pool a second to initialize if needed
setTimeout(run, 1000);
