// Follow-up to seedCourseFinder.js: tags real Study Abroad (wbl_abroad) and WBL
// domestic degree-programme courses with Course Finder metadata. The first seed
// only covered plain Skill Courses, so WBL/Study Abroad courses had no metadata
// and could never be recommended even though the engine always included them.
require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

const COURSE_METADATA = [
    {
        id: 'course_1788241059578', // Diploma in Hotel Management (wbl_abroad)
        career_category: 'Hospitality & Tourism',
        career_roles: ['Hotel Manager', 'Hospitality Operations Manager'],
        skills_developed: ['Hospitality Management', 'Customer Service', 'Communication'],
        recommended_education: ['Class 12', 'Diploma', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Practical projects'],
        duration_weeks: 52
    },
    {
        id: 'course_1788410172637', // Diploma in Professional Chef (wbl_abroad)
        career_category: 'Hospitality & Tourism',
        career_roles: ['Professional Chef', 'Culinary Manager'],
        skills_developed: ['Culinary Arts', 'Hospitality Management', 'Management'],
        recommended_education: ['Class 12', 'Diploma'],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Practical projects', 'Mentor guidance'],
        duration_weeks: 52
    },
    {
        id: 'course_1787204844975', // BBA - Digital Marketing with AI (wbl_domestic)
        career_category: 'Digital Marketing',
        career_roles: ['Digital Marketer', 'Marketing Executive'],
        skills_developed: ['Digital Marketing', 'Management', 'Communication'],
        recommended_education: ['Class 12', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Live classes', 'AI-powered learning'],
        duration_weeks: 156
    },
    {
        id: 'course_1787207211431', // BBA - Hospital Administration (wbl_domestic)
        career_category: 'Healthcare & Hospital Management',
        career_roles: ['Hospital Administrator', 'Healthcare Manager'],
        skills_developed: ['Healthcare Management', 'Hospital Operations', 'Management'],
        recommended_education: ['Class 12', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Live classes'],
        duration_weeks: 156
    },
    {
        id: 'course_1787207725860', // BCA - Data Analytics (wbl_domestic)
        career_category: 'Data & Analytics',
        career_roles: ['Data Analyst', 'Business Analyst'],
        skills_developed: ['Data Analysis', 'SQL', 'Python', 'Programming'],
        recommended_education: ['Class 12', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Live classes', 'Practical projects'],
        duration_weeks: 156
    },
    {
        id: 'course_1787205586763', // MBA - Digital Marketing with AI (wbl_domestic)
        career_category: 'Digital Marketing',
        career_roles: ['Marketing Executive', 'Business Analyst'],
        skills_developed: ['Digital Marketing', 'Management', 'Leadership'],
        recommended_education: ["Bachelor's Degree", "Master's Degree"],
        experience_levels: ['Fresher', 'Less than 1 year', '1-3 years'],
        learning_modes: ['Video lessons', 'Live classes', 'AI-powered learning'],
        duration_weeks: 104
    },
    {
        id: 'course_1787206804227', // MCA - Data Analytics (wbl_domestic)
        career_category: 'Technology & IT',
        career_roles: ['Data Analyst', 'Software Developer'],
        skills_developed: ['Programming', 'Data Analysis', 'Python', 'SQL'],
        recommended_education: ["Bachelor's Degree", "Master's Degree"],
        experience_levels: ['Fresher', 'Less than 1 year'],
        learning_modes: ['Video lessons', 'Practical projects'],
        duration_weeks: 104
    },
    {
        id: 'course_1787210136797', // MCOM - Hospital Administration (wbl_domestic)
        career_category: 'Healthcare & Hospital Management',
        career_roles: ['Hospital Administrator', 'Healthcare Manager'],
        skills_developed: ['Healthcare Management', 'Accounting', 'Management'],
        recommended_education: ["Bachelor's Degree", "Master's Degree"],
        experience_levels: ['Fresher', 'Less than 1 year'],
        learning_modes: ['Video lessons', 'Live classes'],
        duration_weeks: 104
    }
];

(async () => {
    await connectPostgres();
    for (const c of COURSE_METADATA) {
        const r = await query(`
            UPDATE courses SET
                career_category = $1,
                career_roles = $2::jsonb,
                skills_developed = $3::jsonb,
                recommended_education = $4::jsonb,
                experience_levels = $5::jsonb,
                learning_modes = $6::jsonb,
                duration_weeks = $7
            WHERE id = $8
        `, [
            c.career_category, JSON.stringify(c.career_roles), JSON.stringify(c.skills_developed),
            JSON.stringify(c.recommended_education), JSON.stringify(c.experience_levels),
            JSON.stringify(c.learning_modes), c.duration_weeks, c.id
        ]);
        console.log(`[Seed] WBL/Study Abroad metadata ${r.rowCount > 0 ? 'applied' : 'SKIPPED (course id not found)'}: ${c.id}`);
    }
    console.log('[Seed] Done.');
    process.exit(0);
})();
