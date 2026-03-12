const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const checkUserAvatars = async () => {
    try {
        await connectPostgres();
        const res = await query('SELECT id, name, role, profile FROM users WHERE profile IS NOT NULL LIMIT 20');
        console.log('User Profiles (Avatars):');
        res.rows.forEach(row => {
            if (row.profile && row.profile.avatar) {
                console.log(`User ${row.id} (${row.name}): ${row.profile.avatar}`);
            }
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUserAvatars();
