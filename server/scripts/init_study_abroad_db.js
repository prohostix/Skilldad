const { connectPostgres, query } = require('../config/postgres');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const initStudyAbroadDb = async () => {
    try {
        console.log('[StudyAbroad] Connecting to database...'.yellow);
        await connectPostgres();

        console.log('[StudyAbroad] Creating tables...'.cyan);

        // 1. Countries Table
        await query(`
            CREATE TABLE IF NOT EXISTS study_abroad_countries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                image_url TEXT,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✔ Table "study_abroad_countries" created or already exists.'.green);

        // 2. Universities Table
        await query(`
            CREATE TABLE IF NOT EXISTS study_abroad_universities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                country_id UUID REFERENCES study_abroad_countries(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                logo_url TEXT,
                website_url TEXT,
                description TEXT,
                location VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(name, country_id)
            );
        `);
        console.log('✔ Table "study_abroad_universities" created or already exists.'.green);

        // 3. Courses Table
        await query(`
            CREATE TABLE IF NOT EXISTS study_abroad_courses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                university_id UUID REFERENCES study_abroad_universities(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                level VARCHAR(100), -- UG, PG, Diploma
                duration VARCHAR(100),
                fees VARCHAR(255),
                requirements TEXT,
                description TEXT,
                intakes VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✔ Table "study_abroad_courses" created or already exists.'.green);

        console.log('[StudyAbroad] Database initialization complete!'.green.bold);
        process.exit(0);
    } catch (error) {
        console.error('[StudyAbroad] Initialization failed:'.red.bold, error);
        process.exit(1);
    }
};

initStudyAbroadDb();
