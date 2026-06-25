const { query, connectPostgres } = require('../config/postgres');
connectPostgres().then(async () => {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", ['faqs']);
    console.log('FAQ columns:', res.rows.map(r => r.column_name).join(', '));
    process.exit(0);
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
