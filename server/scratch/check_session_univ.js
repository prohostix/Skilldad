const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const checkSessionUniv = async () => {
    await connectPostgres();
    const res = await query("SELECT university_id FROM live_sessions WHERE id = 'sess_1777092724389'");
    console.log(res.rows[0]);
    process.exit(0);
};

checkSessionUniv();
