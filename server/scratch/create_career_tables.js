const { query, connectPostgres } = require('../config/postgres');
require('dotenv').config();

const setupTables = async () => {
    try {
        await connectPostgres();
        console.log('--- Starting Career Portal Table Creation ---');

        // Enable UUID extension
        await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // 1. Vacancies table
        console.log('Creating skilldad_vacancies...');
        await query(`
            CREATE TABLE IF NOT EXISTS skilldad_vacancies (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                description TEXT,
                location TEXT,
                job_type TEXT, -- 'Job', 'Internship'
                salary_range TEXT,
                deadline TIMESTAMP,
                status TEXT DEFAULT 'open', -- 'open', 'closed'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Applications table (links students to vacancies)
        console.log('Creating skilldad_applications...');
        await query(`
            CREATE TABLE IF NOT EXISTS skilldad_applications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                vacancy_id UUID REFERENCES skilldad_vacancies(id) ON DELETE CASCADE,
                student_id TEXT NOT NULL, -- references students.id (text in this DB)
                status TEXT DEFAULT 'pending', -- 'pending', 'shortlisted', 'rejected', 'approved'
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resume_url TEXT,
                admin_remarks TEXT
            )
        `);

        // 3. Placements table (Hall of Fame)
        console.log('Creating skilldad_placements...');
        await query(`
            CREATE TABLE IF NOT EXISTS skilldad_placements (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                student_name TEXT NOT NULL,
                student_photo TEXT,
                company_name TEXT NOT NULL,
                designation TEXT,
                placed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                order_index INTEGER DEFAULT 0
            )
        `);

        console.log('--- Career Portal Tables Created Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Error creating career portal tables:', error);
        process.exit(1);
    }
};

setupTables();
