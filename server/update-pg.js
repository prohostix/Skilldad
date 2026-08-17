require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, process.env.PGSSL_CERT_PATH)).toString()
    }
});

async function updateService() {
    try {
        const client = await pool.connect();
        const result = await client.query(
            "UPDATE services SET title = 'Placement Opportunities' WHERE title = 'Placement Guaranteed'"
        );
        console.log("Updated rows:", result.rowCount);
        client.release();
    } catch (err) {
        console.error("Error updating PG:", err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

updateService();
