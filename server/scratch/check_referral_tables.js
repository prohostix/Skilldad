const { query, connectPostgres } = require('../config/postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkTables = async () => {
    try {
        await connectPostgres();
        const tables = ['referral_codes', 'referrals', 'reward_points', 'users'];
        for (const table of tables) {
            const res = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
            console.log(`Table ${table} exists: ${res.rows[0].exists}`);
            if (res.rows[0].exists) {
                const cols = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
                console.log(`Columns for ${table}:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTables();
