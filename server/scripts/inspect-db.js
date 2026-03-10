const { query, connectPostgres } = require('./config/postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await connectPostgres();
        const tables = ['users', 'courses', 'enrollments', 'exams', 'questions'];
        for (const table of tables) {
            console.log(`\n--- Schema for ${table} ---`);
            const r = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(JSON.stringify(r.rows, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
