require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT),
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, process.env.PGSSL_CERT_PATH)).toString()
    }
});

async function run() {
    try {
        console.log('Adding gallery column...');
        await pool.query('ALTER TABLE skill_dad_universities ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT \'[]\'');
        
        console.log('Adding videos column...');
        await pool.query('ALTER TABLE skill_dad_universities ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT \'[]\'');
        
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
