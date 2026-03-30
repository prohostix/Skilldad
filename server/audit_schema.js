const { connectPostgres, query } = require('./config/postgres');
(async () => {
    try {
        await connectPostgres();
        // Check enrollments columns
        const e = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments'");
        console.log('Enrollments Columns:', e.rows.map(r => r.column_name));
        
        // Check support_tickets columns
        const s = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'support_tickets'");
        console.log('Support Tickets Columns:', s.rows.map(r => r.column_name));
        
        // Check pg_database_size
        try {
            const dbSize = await query("SELECT pg_database_size(current_database()) as size");
            console.log('DB Size:', dbSize.rows[0].size);
        } catch (dbErr) {
            console.error('DB Size Query Failed:', dbErr.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Audit Script Failed:', err);
        process.exit(1);
    }
})();
