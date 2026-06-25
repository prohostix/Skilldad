
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, '../certs/global-bundle.pem')).toString(),
    },
});

const ensureColumns = async () => {
    try {
        const client = await pool.connect();
        
        console.log('Ensuring accent_color column in directors table...');
        await client.query(`
            ALTER TABLE directors 
            ADD COLUMN IF NOT EXISTS accent_color VARCHAR(100) DEFAULT 'primary';
        `);
        
        console.log('Update successful!');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

ensureColumns();
