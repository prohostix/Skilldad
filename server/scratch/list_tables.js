require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const run = async () => {
    const sslCertPath = path.join(__dirname, '..', 'certs', 'global-bundle.pem');
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

    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

run();
