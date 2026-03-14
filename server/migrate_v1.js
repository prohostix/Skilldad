const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, 'certs/global-bundle.pem')).toString(),
    },
});

async function runMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Updating courses table...');
        // Add brochure_url if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='brochure_url') THEN
                    ALTER TABLE courses ADD COLUMN brochure_url TEXT;
                END IF;
            END $$;
        `);

        // Add university_tools if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='university_tools') THEN
                    ALTER TABLE courses ADD COLUMN university_tools JSONB DEFAULT '[]';
                END IF;
            END $$;
        `);

        console.log('Database migration completed successfully.');
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
