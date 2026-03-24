const { connectPostgres, query } = require('./config/postgres');

async function checkTables() {
    try {
        await connectPostgres();
        
        const tables = [
            'progress', 'submissions', 'enrollments', 'projects', 
            'interactive_contents', 'live_sessions', 'payments', 
            'transactions', 'results', 'exam_submissions_new', 
            'questions', 'exams', 'payouts', 'discounts', 
            'documents', 'courses', 'users'
        ];

        console.log('Checking tables...');
        for (const table of tables) {
            try {
                const res = await query(`SELECT 1 FROM ${table} LIMIT 1`);
                console.log(`✅ Table ${table} exists`);
            } catch (err) {
                console.error(`❌ Table ${table} DOES NOT EXIST or error: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Fatal error connecting to Postgres:', err.message);
    }
    process.exit(0);
}

checkTables();
