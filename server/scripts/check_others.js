const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const checkOthers = async () => {
    try {
        await connectPostgres();
        
        console.log('--- Partner Logos ---');
        const plRes = await query('SELECT id, name, logo_url FROM partner_logos');
        console.table(plRes.rows);

        console.log('--- Services ---');
        const sRes = await query('SELECT id, title, icon FROM services');
        console.table(sRes.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkOthers();
