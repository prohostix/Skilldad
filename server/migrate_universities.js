require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function migrate() {
    try {
        await connectPostgres();
        console.log('Adding new columns to skill_dad_universities...');
        await query(`
            ALTER TABLE skill_dad_universities 
            ADD COLUMN IF NOT EXISTS badge TEXT,
            ADD COLUMN IF NOT EXISTS foundation_year TEXT,
            ADD COLUMN IF NOT EXISTS total_scholars TEXT,
            ADD COLUMN IF NOT EXISTS specialized_courses TEXT,
            ADD COLUMN IF NOT EXISTS quality_rating TEXT,
            ADD COLUMN IF NOT EXISTS career_success TEXT,
            ADD COLUMN IF NOT EXISTS global_network TEXT,
            ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb;
        `);
        console.log('Successfully added columns.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
