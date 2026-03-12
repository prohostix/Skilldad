require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function migrate() {
    console.log('🚀 Starting migration: Adding is_featured column to courses table...');
    try {
        await connectPostgres();
        
        // Check if column exists
        const checkColumn = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='courses' AND column_name='is_featured'
        `);

        if (checkColumn.rows.length === 0) {
            await query(`ALTER TABLE courses ADD COLUMN is_featured BOOLEAN DEFAULT FALSE`);
            console.log('✅ Column is_featured added successfully.');
        } else {
            console.log('ℹ️ Column is_featured already exists.');
        }

        // Initialize existing courses to false
        await query(`UPDATE courses SET is_featured = FALSE WHERE is_featured IS NULL`);
        console.log('✅ Values initialized.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
