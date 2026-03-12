const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const checkSchema = async () => {
    try {
        await connectPostgres();
        
        console.log('--- Partner Logos Columns ---');
        const plCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'partner_logos'");
        console.table(plCols.rows);

        console.log('--- Services Columns ---');
        const sCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'services'");
        console.table(sCols.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkSchema();
