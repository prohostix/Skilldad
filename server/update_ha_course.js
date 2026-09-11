const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function updateCourses() {
    const digitalMarketingOutcomes = [
        { icon: 'megaphone', title: 'Digital Marketing Fundamentals', description: 'Understand the core concepts, channels, and strategies.' },
        { icon: 'globe', title: 'Website & Landing Page Optimization', description: 'Learn to optimize websites for better visibility and conversions.' },
        { icon: 'globe', title: 'SEO & Content Marketing', description: 'Rank higher on search engines and create content that converts.' },
        { icon: 'briefcase', title: 'Social Media Marketing with AI', description: 'Create engaging content, grow your audience, and boost engagement.' },
        { icon: 'file', title: 'Paid Advertising & Google Ads', description: 'Run high-performing ad campaigns and maximize ROI.' },
        { icon: 'mail', title: 'Email Marketing & Automation', description: 'Build email campaigns that nurture leads and drive sales.' },
        { icon: 'chart', title: 'Analytics & Data Driven Growth', description: 'Use analytics tools to measure performance and make smart decisions.' },
        { icon: 'bot', title: 'AI Tools for Marketing & Automation', description: 'Leverage AI tools to save time, automate tasks, and scale faster.' }
    ];

    const hospitalAdminOutcomes = [
        { icon: 'briefcase', title: 'Hospital Operations', description: 'Manage day-to-day hospital administrative operations' },
        { icon: 'file', title: 'Regulatory Compliance', description: 'Understand healthcare regulations, compliance, and quality standards' },
        { icon: 'target', title: 'Resource Planning', description: 'Coordinate patient care logistics and hospital resource planning' },
        { icon: 'chart', title: 'Financial Management', description: 'Apply financial and budget management principles in healthcare settings' },
        { icon: 'check', title: 'Team Leadership', description: 'Lead cross-departmental teams within a hospital ecosystem' },
        { icon: 'megaphone', title: 'Service Improvement', description: 'Implement patient satisfaction and service improvement strategies' }
    ];
    
    try {
        // Update Digital Marketing courses
        const dmRes = await pool.query("UPDATE courses SET learning_outcomes = $1::jsonb WHERE title ILIKE '%Digital Marketing%' RETURNING id, title;", [JSON.stringify(digitalMarketingOutcomes)]);
        console.log('Updated Digital Marketing courses:', dmRes.rows);

        // Update Hospital Administration courses
        const haRes = await pool.query("UPDATE courses SET learning_outcomes = $1::jsonb WHERE title ILIKE '%Hospital Administration%' RETURNING id, title;", [JSON.stringify(hospitalAdminOutcomes)]);
        console.log('Updated Hospital Admin courses:', haRes.rows);
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
updateCourses();
