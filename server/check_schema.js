require('dotenv').config();
const { query } = require('./config/postgres');

async function run() {
    await new Promise(r => setTimeout(r, 1000));
    try {
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'study_abroad_universities'");
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
