require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const run = async () => {
    const sslCertPath = path.join(__dirname, '..', 'certs', 'global-bundle.pem');
    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT || 5432,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(sslCertPath).toString(),
        },
    });

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS certificates (
            id VARCHAR(50) PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            university_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'PENDING',
            file_url TEXT,
            apply_date TIMESTAMP DEFAULT NOW(),
            approval_date TIMESTAMP,
            issue_date TIMESTAMP,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Add indices for performance
        CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
        CREATE INDEX IF NOT EXISTS idx_certificates_university ON certificates(university_id);
        CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
    `;

    try {
        console.log('Creating certificates table...');
        await pool.query(createTableQuery);
        console.log('Certificates table created successfully!');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await pool.end();
    }
};

run();
