const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Connected to DB. Checking faqs table columns...');

        // Check existing columns
        const colRes = await client.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'faqs'
        `);
        const cols = colRes.rows.map(r => r.column_name);
        console.log('Existing columns:', cols);

        // Add help_link if missing
        if (!cols.includes('help_link')) {
            await client.query('ALTER TABLE faqs ADD COLUMN help_link TEXT');
            console.log('✅ Added: help_link');
        } else {
            console.log('ℹ️  Already exists: help_link');
        }

        // Add demo_video_link if missing
        if (!cols.includes('demo_video_link')) {
            await client.query('ALTER TABLE faqs ADD COLUMN demo_video_link TEXT');
            console.log('✅ Added: demo_video_link');
        } else {
            console.log('ℹ️  Already exists: demo_video_link');
        }

        console.log('Migration complete!');
    } catch (e) {
        console.error('Migration failed:', e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
