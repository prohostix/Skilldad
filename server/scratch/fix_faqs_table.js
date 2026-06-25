const { query, connectPostgres } = require('../config/postgres');

async function fix() {
    try {
        await connectPostgres();

        // Check existing columns
        const colRes = await query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
            ['faqs']
        );
        const cols = colRes.rows.map(r => r.column_name);
        console.log('Existing columns:', cols.join(', '));

        if (!cols.includes('help_link')) {
            await query('ALTER TABLE faqs ADD COLUMN help_link TEXT');
            console.log('Added: help_link');
        } else { console.log('OK: help_link'); }

        if (!cols.includes('demo_video_link')) {
            await query('ALTER TABLE faqs ADD COLUMN demo_video_link TEXT');
            console.log('Added: demo_video_link');
        } else { console.log('OK: demo_video_link'); }

        if (!cols.includes('views')) {
            await query('ALTER TABLE faqs ADD COLUMN views INTEGER DEFAULT 0');
            console.log('Added: views');
        } else { console.log('OK: views'); }

        if (!cols.includes('upvotes')) {
            await query('ALTER TABLE faqs ADD COLUMN upvotes INTEGER DEFAULT 0');
            console.log('Added: upvotes');
        } else { console.log('OK: upvotes'); }

        if (!cols.includes('downvotes')) {
            await query('ALTER TABLE faqs ADD COLUMN downvotes INTEGER DEFAULT 0');
            console.log('Added: downvotes');
        } else { console.log('OK: downvotes'); }

        if (!cols.includes('updated_at')) {
            await query('ALTER TABLE faqs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()');
            console.log('Added: updated_at');
        } else { console.log('OK: updated_at'); }

        // Ensure faq_search_analytics table exists
        await query(`
            CREATE TABLE IF NOT EXISTS faq_search_analytics (
                id SERIAL PRIMARY KEY,
                query TEXT UNIQUE NOT NULL,
                count INTEGER DEFAULT 1,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('faq_search_analytics table ensured');
        console.log('All done!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

fix();
