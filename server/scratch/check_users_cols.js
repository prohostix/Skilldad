const { connectPostgres, query } = require('../config/postgres');

require('dotenv').config();

const checkColumns = async () => {
    await connectPostgres();
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
};

checkColumns();
