const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sslCertPath = path.join(__dirname, 'certs/global-bundle.pem');

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(sslCertPath).toString(),
    },
});

async function inspectTable(tableName) {
    const res = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY column_name
    `, [tableName]);
    console.log(`\n--- TABLE: ${tableName} ---`);
    res.rows.forEach(row => console.log(`${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`));
}

async function inspect() {
    try {
        await inspectTable('courses');
        await inspectTable('users');
        await inspectTable('transactions');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
