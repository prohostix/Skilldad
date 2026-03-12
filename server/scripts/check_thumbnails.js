const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { query, connectPostgres } = require('../config/postgres');

const checkThumbnails = async () => {
    try {
        console.log('Using PGHOST:', process.env.PGHOST);
        await connectPostgres();
        const res = await query('SELECT id, title, thumbnail FROM courses');
        console.log('Course Thumbnails:');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkThumbnails();
