const { query } = require('../config/postgres');

async function test() {
    try {
        const res = await query('SELECT id, title, is_published, status FROM courses LIMIT 10;');
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
test();
