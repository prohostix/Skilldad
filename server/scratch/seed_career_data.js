const { query, connectPostgres } = require('../config/postgres');
require('dotenv').config();

const seedData = async () => {
    try {
        await connectPostgres();
        console.log('Seeding Career Data...');

        // 1. Seed Vacancies
        const vacancyRes = await query(`
            INSERT INTO skilldad_vacancies (title, company, description, location, job_type, salary_range, deadline)
            VALUES 
            ('Senior Frontend Engineer', 'Google', 'Lead the development of next-gen search interface using React.', 'Remote', 'Job', '25-40 LPA', '2026-12-31'),
            ('Data Science Intern', 'Microsoft', 'Work on cutting edge AI models for Azure.', 'Hybrid - Bangalore', 'Internship', '50k/mo', '2026-11-15'),
            ('Full Stack Developer', 'Amazon', 'Building scalable microservices for AWS.', 'In-Office - Hyderabad', 'Job', '18-24 LPA', '2026-10-20')
            RETURNING id
        `);

        // 2. Seed Placements (Hall of Fame)
        await query(`
            INSERT INTO skilldad_placements (student_name, company_name, designation, placed_date, order_index)
            VALUES 
            ('Rohan Sharma', 'Meta', 'Software Engineer', '2026-03-15', 1),
            ('Aditi Rao', 'Adobe', 'Product Designer', '2026-02-28', 2),
            ('Suresh Kumar', 'NVIDIA', 'LLM Architect', '2026-01-10', 3),
            ('Priya Patel', 'Netflix', 'Backend lead', '2025-12-20', 4)
        `);

        console.log('Successfully seeded career portal data.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
