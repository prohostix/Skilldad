const { connectPostgres, query } = require('./config/postgres.js');
require('dotenv').config();
connectPostgres().then(async () => {
    try {
        const res = await query("SELECT count(*) FROM users WHERE role = 'student'");
        console.log(res.rows);
    } catch(e) {
        console.log(e.message);
    }
    process.exit(0);
});
