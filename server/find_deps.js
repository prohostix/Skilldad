require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function findDependencies() {
    try {
        await connectPostgres();
        const res = await query(`
      SELECT 
          tc.table_name, 
          kcu.column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name 
          JOIN information_schema.constraint_column_usage AS ccu 
            ON ccu.constraint_name = tc.constraint_name 
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='exams'
    `);
        console.log('DEPENDENCIES:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
findDependencies();
