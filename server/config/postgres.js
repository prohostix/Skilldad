const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

let pool;

const connectPostgres = async () => {
    try {
        const sslCertPath = path.join(__dirname, '..', process.env.PGSSL_CERT_PATH || 'certs/global-bundle.pem');

        pool = new Pool({
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

        // Test the connection
        const client = await pool.connect();
        console.log(`PostgreSQL Connected: ${process.env.PGHOST}`.cyan.underline);
        client.release();

        return pool;
    } catch (error) {
        console.error(`PostgreSQL Error: ${error.message}`.red);
        // We don't exit here to allow the server to potentially run on MongoDB during migration
    }
};

const getPool = () => pool;

const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
        console.log('[PG] Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
};

module.exports = { connectPostgres, getPool, query };
