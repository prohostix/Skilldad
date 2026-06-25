require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');
const fs = require('fs');

async function check() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        
        const tables = ['job_openings', 'applications', 'students'];
        const results = {};
        
        for (const table of tables) {
            const res = await query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1", [table]);
            results[table] = res.rows;
        }
        
        fs.writeFileSync('scratch/jobs_schema.json', JSON.stringify(results, null, 2));
        console.log('Success - wrote to scratch/jobs_schema.json');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
