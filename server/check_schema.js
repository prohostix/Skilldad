require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function checkSchema() {
    try {
        await connectPostgres();
        
        console.log('--- EXAMS SCHEMA ---');
        const examsRes = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'exams'
        `);
        examsRes.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
