
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, '../certs/global-bundle.pem')).toString(),
    },
});

const runMigration = async () => {
    try {
        console.log('Connecting to PostgreSQL...');
        const client = await pool.connect();
        
        console.log('Creating success_stories table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_success_stories (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                campus VARCHAR(255),
                package VARCHAR(100),
                role VARCHAR(255),
                image TEXT,
                story TEXT,
                video_url TEXT,
                "order" INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Seeding initial Success Stories...');
        const successStories = [
            { name: 'Rahul Kumar', campus: 'CIT Campus', package: '18 LPA', role: 'Full Stack Dev', image: '/assets/success/student1.png', story: 'Transformed his technical core within 6 months. Leveraging SkillDad’s neural learning path to master advanced industry modules.' },
            { name: 'Sanya Sharma', campus: 'Global University', package: '24 LPA', role: 'AI Researcher', image: '/assets/success/student2.png', story: 'Mastered neural architectures and secured top ranking. Leveraging SkillDad’s neural learning path to master advanced industry modules.' },
            { name: 'Arjun Mehta', campus: 'Tech Institute', package: '15 LPA', role: 'Product Manager', image: '/assets/success/student3.png', story: 'Achieved career momentum through strategic sync. Leveraging SkillDad’s neural learning path to master advanced industry modules.' }
        ];

        for (let i = 0; i < successStories.length; i++) {
            const s = successStories[i];
            await client.query(`
                INSERT INTO student_success_stories (id, name, campus, package, role, image, story, "order", is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                ON CONFLICT DO NOTHING
            `, [crypto.randomUUID(), s.name, s.campus, s.package, s.role, s.image, s.story, i]);
        }

        console.log('Seeding IITan Leadership into directors table...');
        const leads = [
            { name: 'Arpit Jain', alumni: 'IIT Delhi', role: 'Chief Executive Architect', image: '/assets/leadership/ceo.png', color: 'primary' },
            { name: 'Neeraj Sharma', alumni: 'IIT Kanpur', role: 'Head of Technology Sync', image: '/assets/leadership/cto.png', color: 'emerald-400' },
            { name: 'Priyanka Chopra', alumni: 'IIT Madras', role: 'Head of Operations & Excellence', image: '/assets/leadership/ops.png', color: 'amber-400' }
        ];

        for (let i = 0; i < leads.length; i++) {
            const l = leads[i];
            await client.query(`
                INSERT INTO directors (id, name, title, image, "order", category, bio, university, display_target, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'IIT_LEADERSHIP', true)
                ON CONFLICT DO NOTHING
            `, [crypto.randomUUID(), l.name, l.role, l.image, i + 10, 'IITAN', 'Driving the core functional strategy and system reliability for SkillDad’s pan-India academic operations.', l.alumni]);
        }

        console.log('Migration completed successfully!');
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
