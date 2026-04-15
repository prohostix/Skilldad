const { connectPostgres, query } = require('../config/postgres');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await connectPostgres();
        console.log('Seeding Study Abroad data...'.yellow);

        // 1. Countries
        const countries = [
            { id: crypto.randomUUID(), name: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070', desc: 'Home to world-renowned institutions like Oxford and Cambridge.' },
            { id: crypto.randomUUID(), name: 'Canada', img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2011', desc: 'Renowned for high-quality education and post-graduate work opportunities.' },
            { id: crypto.randomUUID(), name: 'Australia', img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2130', desc: 'Offering a vibrant lifestyle and globally recognized degrees.' }
        ];

        for (const c of countries) {
            await query(
                'INSERT INTO study_abroad_countries (id, name, image_url, description) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
                [c.id, c.name, c.img, c.desc]
            );
        }

        // Get UK and Canada IDs (they might have changed if already existed)
        const ukRes = await query('SELECT id FROM study_abroad_countries WHERE name = $1', ['United Kingdom']);
        const caRes = await query('SELECT id FROM study_abroad_countries WHERE name = $1', ['Canada']);
        
        const ukId = ukRes.rows[0].id;
        const caId = caRes.rows[0].id;

        // 2. Universities
        const unis = [
            { id: crypto.randomUUID(), country_id: ukId, name: 'University of Oxford', location: 'Oxford, England', web: 'https://www.ox.ac.uk', desc: 'The oldest university in the English-speaking world.' },
            { id: crypto.randomUUID(), country_id: ukId, name: 'Imperial College London', location: 'London, England', web: 'https://www.imperial.ac.uk', desc: 'A world-class university focusing on science, engineering, medicine and business.' },
            { id: crypto.randomUUID(), country_id: caId, name: 'University of Toronto', location: 'Toronto, Ontario', web: 'https://www.utoronto.ca', desc: 'Canada\'s leading institution of learning, discovery and knowledge creation.' }
        ];

        for (const u of unis) {
            await query(
                'INSERT INTO study_abroad_universities (id, country_id, name, website_url, description, location) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name, country_id) DO NOTHING',
                [u.id, u.country_id, u.name, u.web, u.desc, u.location]
            );
        }

        // 3. Courses
        const oxRes = await query('SELECT id FROM study_abroad_universities WHERE name = $1', ['University of Oxford']);
        const torRes = await query('SELECT id FROM study_abroad_universities WHERE name = $1', ['University of Toronto']);
        
        const oxId = oxRes.rows[0].id;
        const torId = torRes.rows[0].id;

        const courses = [
            { uni_id: oxId, name: 'Computer Science', level: 'UG', dur: '3 Years', fees: '£35,000 / year', req: 'A*A*A at A-level (CS/Math required).', desc: 'Deep theoretical and practical computer science.', intake: 'October' },
            { uni_id: oxId, name: 'MBA', level: 'PG', dur: '1 Year', fees: '£71,000', req: 'GMAT/GRE, 2+ years work experience.', desc: 'One-year intensive business program.', intake: 'September' },
            { uni_id: torId, name: 'Applied Computing', level: 'PG', dur: '16 Months', fees: '$45,000 CAD / year', req: 'Bachelors in CS or related field, GPA 3.3+', desc: 'Practical focus on software engineering and AI.', intake: 'September, January' }
        ];

        for (const co of courses) {
            await query(
                'INSERT INTO study_abroad_courses (id, university_id, name, level, duration, fees, requirements, description, intakes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [crypto.randomUUID(), co.uni_id, co.name, co.level, co.dur, co.fees, co.req, co.desc, co.intake]
            );
        }

        console.log('Seeding complete!'.green.bold);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:'.red, error);
        process.exit(1);
    }
};

seedData();
