require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const result = await query("SELECT id, name, email, profile FROM users WHERE name ILIKE '%rinsna%' OR name ILIKE '%nidha%'");
        console.log('Student Records:');
        result.rows.forEach(row => {
            console.log(`\nID: ${row.id} | Name: ${row.name}`);
            console.log('Profile:', row.profile);
            if (typeof row.profile === 'string') {
                try {
                    console.log('Parsed Profile:', JSON.parse(row.profile));
                } catch(e) {
                    console.log('Profile is NOT valid JSON string');
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
