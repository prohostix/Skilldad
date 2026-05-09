const { query, connectPostgres } = require('./config/postgres');
require('dotenv').config();

const addColumns = async () => {
    try {
        await connectPostgres();
        console.log('Adding columns to skilldad_vacancies...');
        await query(`
            ALTER TABLE skilldad_vacancies
            ADD COLUMN IF NOT EXISTS requirements TEXT,
            ADD COLUMN IF NOT EXISTS about_company TEXT;
        `);
        console.log('Columns added successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Error adding columns:', e);
        process.exit(1);
    }
};

addColumns();
