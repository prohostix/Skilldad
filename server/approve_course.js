const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.query("UPDATE courses SET status = 'approved' WHERE title = 'Diploma in Hotel Management'")
    .then(res => console.log('Updated rows:', res.rowCount))
    .catch(console.error)
    .finally(() => pool.end());
