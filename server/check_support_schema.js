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

async function checkSupportSchema() {
    try {
        console.log('Checking support_tickets table...');
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'support_tickets'");
        if (res.rows.length === 0) {
            console.log('Table support_tickets does NOT exist!');
        } else {
            console.log('Table support_tickets exists with columns:');
            console.log(JSON.stringify(res.rows, null, 2));
        }

        // Check if there are any tickets
        const tickets = await pool.query("SELECT COUNT(*) FROM support_tickets");
        console.log(`Total tickets: ${tickets.rows[0].count}`);

    } catch (err) {
        console.error('Error checking support schema:', err.message);
    } finally {
        await pool.end();
    }
}

checkSupportSchema();
