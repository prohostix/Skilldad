const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function insertCourse() {
    try {
        const id = 'course_' + Date.now();
        const title = 'Diploma in Hotel Management';
        const description = 'The Diploma in Hotel Management is a unique international education pathway designed for students who have completed 10th standard. The program combines academic learning, practical industry exposure, and Work-Based Learning (WBL) in Malaysia, enabling students to earn internationally recognized qualifications while gaining real industry experience.';
        const category = 'Hospitality';
        const price = 100000;
        const program_type = 'wbl_abroad';
        const instructor_name = 'World Passport';
        const university_name = 'Southern International University College';
        
        const modules = [
            {
                title: "Phase 1: Foundation (India)",
                videos: [
                    {
                        _id: uuidv4(),
                        title: "Months 1–6: Training & Paid Internship",
                        description: "Training at World Passport with paid internship in India. Diploma certification from a renowned UGC-approved Indian University after successful completion.",
                        duration: "6 Months",
                        videoType: "document",
                        url: ""
                    }
                ]
            },
            {
                title: "Phase 2: Classroom Learning (Malaysia)",
                videos: [
                    {
                        _id: uuidv4(),
                        title: "Months 7–10: Academic Learning",
                        description: "Classroom learning in Malaysia. No stipend. Food and accommodation provided.",
                        duration: "4 Months",
                        videoType: "document",
                        url: ""
                    }
                ]
            },
            {
                title: "Phase 3: Work-Based Learning (Malaysia)",
                videos: [
                    {
                        _id: uuidv4(),
                        title: "Months 11–28: Industry Experience",
                        description: "Work-Based Learning with 5–6 internship days/week, daily 1-hour online session, and one face-to-face class/week. Approximate stipend: MYR 1,500/month. Accommodation and meals provided.",
                        duration: "18 Months",
                        videoType: "document",
                        url: ""
                    }
                ]
            }
        ];

        const learning_outcomes = [
            { icon: 'globe', title: 'International Education', description: 'Study abroad in Malaysia and earn globally recognized qualifications.' },
            { icon: 'briefcase', title: 'Earn While You Learn', description: 'Gain real industry experience with Work-Based Learning and monthly stipends.' },
            { icon: 'check', title: 'Dual Certification', description: 'Get certifications from a renowned Indian University and a Malaysian University.' },
            { icon: 'target', title: 'Career Opportunities', description: 'Guaranteed employment opportunities in Malaysia and Singapore, subject to performance.' }
        ];

        const query = `
            INSERT INTO courses (
                id, title, description, category, price, is_published, 
                instructor_name, university_name, program_type, modules, learning_outcomes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb
            ) RETURNING id, title;
        `;

        const values = [
            id, title, description, category, price, true,
            instructor_name, university_name, program_type, 
            JSON.stringify(modules), JSON.stringify(learning_outcomes)
        ];

        const res = await pool.query(query, values);
        console.log('Successfully inserted WBL Abroad Course:', res.rows[0]);
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

insertCourse();
