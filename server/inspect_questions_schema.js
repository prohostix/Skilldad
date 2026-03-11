require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function run() {
  try {
    await connectPostgres();
    const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'questions'
    `);
    console.log('Questions Table Schema:');
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
