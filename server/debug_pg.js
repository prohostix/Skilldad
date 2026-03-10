
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectPostgres = async () => {
    try {
        const sslCertPath = path.join(__dirname, 'config', '..', process.env.PGSSL_CERT_PATH || 'certs/global-bundle.pem');
        console.log('Trying SSL cert at:', sslCertPath);

        if (!fs.existsSync(sslCertPath)) {
            console.error('CERT NOT FOUND AT:', sslCertPath);
        } else {
            console.log('Cert file exists.');
        }

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

        const client = await pool.connect();
        console.log('PostgreSQL Connected successfully');
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('PostgreSQL Connection Error:', error);
        process.exit(1);
    }
};

connectPostgres();
