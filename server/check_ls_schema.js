const { connectPostgres, query } = require('./config/postgres');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    try {
        await connectPostgres();
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'live_sessions'");
        console.log('SCHEMA_START');
        console.log(JSON.stringify(res.rows, null, 2));
        console.log('SCHEMA_END');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
