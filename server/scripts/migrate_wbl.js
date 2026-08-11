require('dotenv').config({ path: '../.env' });
const { query, connectPostgres } = require('../config/postgres');

async function migrateWbl() {
    try {
        console.log('Starting WBL database migration...');
        await connectPostgres();

        await query(`
            CREATE TABLE IF NOT EXISTS wbl_courses (
                id UUID PRIMARY KEY,
                category VARCHAR(50) NOT NULL CHECK (category IN ('domestic', 'abroad')),
                title VARCHAR(255) NOT NULL,
                university_name VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                duration VARCHAR(100),
                fees VARCHAR(100),
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('wbl_courses table created or already exists.');

        console.log('WBL database migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error migrating WBL database:', error);
        process.exit(1);
    }
}

migrateWbl();
