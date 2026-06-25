const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkProfile = async () => {
    await connectPostgres();
    const res = await query("SELECT name, profile FROM users WHERE role = 'student' AND profile IS NOT NULL LIMIT 5");
    res.rows.forEach(row => {
        console.log(`User: ${row.name}`);
        console.log(`Profile: ${JSON.stringify(row.profile, null, 2)}`);
        console.log('---');
    });

    process.exit(0);
};

checkProfile();
