require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function inspect() {
    try {
        await connectPostgres();
        
        console.log('--- TABLE: referral_codes ---');
        const refCodes = await query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'referral_codes'");
        console.table(refCodes.rows);

        console.log('\n--- TABLE: referrals ---');
        const referrals = await query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'referrals'");
        console.table(referrals.rows);

        console.log('\n--- TABLE: reward_points ---');
        const points = await query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'reward_points'");
        console.table(points.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
