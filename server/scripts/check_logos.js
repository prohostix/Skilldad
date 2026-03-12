const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const checkLogos = async () => {
    try {
        await connectPostgres();
        
        console.log('--- Partner Logos ---');
        const res = await query('SELECT id, name, logo FROM partner_logos WHERE logo IS NOT NULL');
        console.table(res.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkLogos();
