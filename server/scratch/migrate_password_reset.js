const { connectPostgres, query } = require('../config/postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const migrate = async () => {
    try {
        console.log('Connecting to PostgreSQL...');
        await connectPostgres();
        
        console.log('Adding reset_password_token column...');
        try {
            await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)');
            console.log('Added reset_password_token');
        } catch (e) {
            console.log('reset_password_token already exists or error:', e.message);
        }

        console.log('Adding reset_password_expire column...');
        try {
            await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire BIGINT');
            console.log('Added reset_password_expire');
        } catch (e) {
            console.log('reset_password_expire already exists or error:', e.message);
        }
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

migrate();
