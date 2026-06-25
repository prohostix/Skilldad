const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkRinsnaUniv = async () => {
    await connectPostgres();
    const res = await query("SELECT university_id FROM users WHERE id = 'user_1774262164137'");
    console.log(res.rows[0]);
    process.exit(0);
};

checkRinsnaUniv();
