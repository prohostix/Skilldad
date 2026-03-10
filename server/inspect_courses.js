require('dotenv').config();
const { query, connectPostgres } = require('./config/postgres');

async function describeCourses() {
    try {
        await connectPostgres();
        const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
    `);
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

describeCourses();
