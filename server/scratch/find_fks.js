require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function run() {
    try {
        await connectPostgres();
        
        // Find which tables reference users(id)
        const fkQuery = `
            SELECT
                tc.table_name, 
                kcu.column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='users';
        `;
        
        const res = await query(fkQuery);
        console.log("Foreign Key References:");
        console.log(JSON.stringify(res.rows, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
