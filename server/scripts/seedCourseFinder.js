// One-time (idempotent) seed for the Course Finder's default 10 questions and
// answer-to-course-mapping config. Safe to re-run: it no-ops if questions already
// exist. Run with: node scripts/seedCourseFinder.js
require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const QUESTIONS = [
    {
        category: 'Goal',
        question: 'What is your main goal right now?',
        helperText: 'Choose the option that feels closest to your goal.',
        type: 'single',
        answers: [
            { label: 'Get a job', icon: 'Target', mapping: { priority: 'high' } },
            { label: 'Change my career', icon: 'Repeat', mapping: { priority: 'high' } },
            { label: 'Grow in my current career', icon: 'TrendingUp', mapping: { priority: 'medium' } },
            { label: 'Continue my education', icon: 'GraduationCap', mapping: { priority: 'medium' } },
            { label: 'Start a new career', icon: 'Rocket', mapping: { priority: 'high' } },
            { label: 'Learn a new skill', icon: 'Lightbulb', mapping: { priority: 'low' } }
        ]
    },
    {
        category: 'Career Interest',
        question: 'What gets you excited?',
        helperText: 'Pick as many as you like - this helps us find the right career area for you.',
        type: 'multi',
        answers: [
            { label: 'Technology & IT', icon: 'Laptop', mapping: { careerCategory: 'Technology & IT' } },
            { label: 'Data & Analytics', icon: 'BarChart3', mapping: { careerCategory: 'Data & Analytics' } },
            { label: 'Digital Marketing', icon: 'Megaphone', mapping: { careerCategory: 'Digital Marketing' } },
            { label: 'Healthcare & Hospital Management', icon: 'HeartPulse', mapping: { careerCategory: 'Healthcare & Hospital Management' } },
            { label: 'Finance & Accounting', icon: 'Wallet', mapping: { careerCategory: 'Finance & Accounting' } },
            { label: 'Human Resources', icon: 'Users', mapping: { careerCategory: 'Human Resources' } },
            { label: 'Business & Management', icon: 'Briefcase', mapping: { careerCategory: 'Business & Management' } },
            { label: 'Design & Creative', icon: 'Palette', mapping: { careerCategory: 'Design & Creative' } },
            { label: 'Sales & Customer Service', icon: 'Handshake', mapping: { careerCategory: 'Sales & Customer Service' } },
            { label: 'Other', icon: 'MoreHorizontal', mapping: {} }
        ]
    },
    {
        category: 'Dream Job',
        question: 'What kind of job would you love to have?',
        helperText: 'Search or pick a role - or tell us you are still exploring.',
        type: 'single',
        config: { searchable: true, allowCustom: true },
        answers: [
            { label: 'Data Analyst', icon: 'BarChart3', mapping: {} },
            { label: 'Digital Marketer', icon: 'Megaphone', mapping: {} },
            { label: 'Hospital Administrator', icon: 'HeartPulse', mapping: {} },
            { label: 'HR Executive', icon: 'Users', mapping: {} },
            { label: 'Business Analyst', icon: 'Briefcase', mapping: {} },
            { label: 'Software Developer', icon: 'Code', mapping: {} },
            { label: 'Accountant', icon: 'Wallet', mapping: {} },
            { label: 'Project Manager', icon: 'ClipboardCheck', mapping: {} },
            { label: 'Healthcare Manager', icon: 'HeartPulse', mapping: {} },
            { label: "I'm not sure yet", icon: 'Compass', mapping: {} }
        ]
    },
    {
        category: 'Education',
        question: 'What is your highest level of education?',
        helperText: 'This helps us match courses that fit where you are today.',
        type: 'single',
        answers: [
            { label: 'Class 10', icon: 'BookOpen', mapping: {} },
            { label: 'Class 12', icon: 'BookOpen', mapping: {} },
            { label: 'Diploma', icon: 'FileCheck', mapping: {} },
            { label: "Bachelor's Degree", icon: 'GraduationCap', mapping: {} },
            { label: "Master's Degree", icon: 'GraduationCap', mapping: {} },
            { label: 'Professional Degree', icon: 'Award', mapping: {} },
            { label: 'Currently studying', icon: 'BookOpen', mapping: {} },
            { label: 'Other', icon: 'MoreHorizontal', mapping: {} }
        ]
    },
    {
        category: 'Experience',
        question: 'Where are you in your career journey?',
        helperText: 'There is no wrong answer - this just helps us calibrate your path.',
        type: 'single',
        answers: [
            { label: 'Student / No experience', icon: 'GraduationCap', mapping: {} },
            { label: 'Fresher', icon: 'Sparkles', mapping: {} },
            { label: 'Less than 1 year', icon: 'Clock', mapping: {} },
            { label: '1-3 years', icon: 'Clock', mapping: {} },
            { label: '3-5 years', icon: 'Clock', mapping: {} },
            { label: '5+ years', icon: 'Clock', mapping: {} }
        ]
    },
    {
        category: 'Skills',
        question: 'Which skills do you already have?',
        helperText: 'Pick everything that applies - we will build on what you already know.',
        type: 'multi',
        config: { allowCustom: true },
        answers: [
            { label: 'Computer Basics', icon: 'Laptop', mapping: {} },
            { label: 'Excel', icon: 'FileSpreadsheet', mapping: {} },
            { label: 'SQL', icon: 'Database', mapping: {} },
            { label: 'Python', icon: 'Code', mapping: {} },
            { label: 'Data Analysis', icon: 'BarChart3', mapping: {} },
            { label: 'Digital Marketing', icon: 'Megaphone', mapping: {} },
            { label: 'Communication', icon: 'MessageCircle', mapping: {} },
            { label: 'Leadership', icon: 'Star', mapping: {} },
            { label: 'Management', icon: 'Briefcase', mapping: {} },
            { label: 'Accounting', icon: 'Wallet', mapping: {} },
            { label: 'Healthcare', icon: 'HeartPulse', mapping: {} },
            { label: 'HR', icon: 'Users', mapping: {} },
            { label: 'Sales', icon: 'Handshake', mapping: {} },
            { label: 'Graphic Design', icon: 'Palette', mapping: {} },
            { label: 'Programming', icon: 'Code', mapping: {} },
            { label: 'Project Management', icon: 'ClipboardCheck', mapping: {} },
            { label: 'None yet', icon: 'Circle', mapping: {} }
        ]
    },
    {
        category: 'Learning Preference',
        question: "What's your favorite way to learn?",
        helperText: 'Pick as many as you like.',
        type: 'multi',
        answers: [
            { label: 'Video lessons', icon: 'PlayCircle', mapping: {} },
            { label: 'Live classes', icon: 'Radio', mapping: {} },
            { label: 'Practical projects', icon: 'Folder', mapping: {} },
            { label: 'Mentor guidance', icon: 'Users', mapping: {} },
            { label: 'AI-powered learning', icon: 'Bot', mapping: {} },
            { label: 'Quizzes & assessments', icon: 'CheckCircle', mapping: {} },
            { label: 'Group discussions', icon: 'MessageCircle', mapping: {} }
        ]
    },
    {
        category: 'Time Availability',
        question: 'How much time can you dedicate to learning each week?',
        helperText: 'Be realistic - we will pace your path around it.',
        type: 'single',
        answers: [
            { label: 'Less than 3 hours', icon: 'Clock', mapping: {} },
            { label: '3-5 hours', icon: 'Clock', mapping: {} },
            { label: '5-10 hours', icon: 'Clock', mapping: {} },
            { label: '10-15 hours', icon: 'Clock', mapping: {} },
            { label: '15+ hours', icon: 'Clock', mapping: {} }
        ]
    },
    {
        category: 'Course Preference',
        question: 'What matters most to you in a course?',
        helperText: 'Pick as many as you like.',
        type: 'multi',
        answers: [
            { label: 'Job opportunities', icon: 'Briefcase', mapping: {} },
            { label: 'Placement support', icon: 'Handshake', mapping: {} },
            { label: 'Recognized certificate', icon: 'Award', mapping: {} },
            { label: 'Practical projects', icon: 'Folder', mapping: {} },
            { label: 'Expert mentors', icon: 'Users', mapping: {} },
            { label: 'Affordable learning', icon: 'Wallet', mapping: {} },
            { label: 'Career growth', icon: 'TrendingUp', mapping: {} },
            { label: 'AI-powered learning', icon: 'Bot', mapping: {} },
            { label: 'University association', icon: 'Landmark', mapping: {} }
        ]
    },
    {
        category: 'Work Preference',
        question: 'Where would you like to work?',
        helperText: 'This helps us surface placement-relevant courses.',
        type: 'single',
        config: { allowLocationSearch: true },
        answers: [
            { label: 'My current city', icon: 'MapPin', mapping: {} },
            { label: 'Anywhere in India', icon: 'MapPin', mapping: {} },
            { label: 'Remote', icon: 'Laptop', mapping: {} },
            { label: 'Abroad', icon: 'Globe', mapping: {} },
            { label: 'Hybrid', icon: 'Building2', mapping: {} }
        ]
    }
];

const COURSE_METADATA = [
    {
        id: 'course_1784876161290', // Hospital Administration
        career_category: 'Healthcare & Hospital Management',
        career_roles: ['Hospital Administrator', 'Healthcare Manager', 'Hospital Operations Manager'],
        skills_developed: ['Healthcare Management', 'Hospital Operations', 'Communication', 'HR Management'],
        recommended_education: ["Bachelor's Degree", "Master's Degree"],
        experience_levels: ['Student / No experience', 'Fresher', 'Less than 1 year'],
        learning_modes: ['Video lessons', 'Practical projects'],
        duration_weeks: 8
    },
    {
        id: 'course_1773918458935', // Health Administrator (Hospital Administration & Management)
        career_category: 'Healthcare & Hospital Management',
        career_roles: ['Healthcare Manager', 'Hospital Administrator'],
        skills_developed: ['Healthcare', 'Hospital Operations', 'Management'],
        recommended_education: ["Bachelor's Degree", 'Diploma'],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Quizzes & assessments'],
        duration_weeks: 10
    },
    {
        id: 'course_1773915851776', // Business Intelligence & Data Analytics
        career_category: 'Data & Analytics',
        career_roles: ['Data Analyst', 'Business Analyst'],
        skills_developed: ['Data Analysis', 'SQL', 'Excel', 'Python'],
        recommended_education: ["Bachelor's Degree", 'Diploma'],
        experience_levels: ['Student / No experience', 'Fresher', 'Less than 1 year'],
        learning_modes: ['Video lessons', 'Practical projects', 'Quizzes & assessments'],
        duration_weeks: 10
    },
    {
        id: 'course_1788332205120', // Data Analytics
        career_category: 'Data & Analytics',
        career_roles: ['Data Analyst'],
        skills_developed: ['Data Analysis', 'SQL', 'Excel'],
        recommended_education: ['Class 12', 'Diploma', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Practical projects'],
        duration_weeks: 8
    },
    {
        id: 'course_1773915919830', // Digital Marketing with AI
        career_category: 'Digital Marketing',
        career_roles: ['Digital Marketer', 'Marketing Executive'],
        skills_developed: ['Digital Marketing', 'Communication'],
        recommended_education: ['Class 12', 'Diploma', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher', 'Less than 1 year'],
        learning_modes: ['Video lessons', 'AI-powered learning'],
        duration_weeks: 6
    },
    {
        id: 'course_1773915321373', // Applied Data Science & Machine Learning for Business
        career_category: 'Technology & IT',
        career_roles: ['Data Analyst', 'Software Developer'],
        skills_developed: ['Python', 'Data Analysis', 'Programming'],
        recommended_education: ["Bachelor's Degree", "Master's Degree"],
        experience_levels: ['Fresher', 'Less than 1 year', '1-3 years'],
        learning_modes: ['Video lessons', 'Practical projects', 'Mentor guidance'],
        duration_weeks: 12
    },
    {
        id: 'course_1773915727395', // Introduction to Logistics & Supply Chain Management
        career_category: 'Business & Management',
        career_roles: ['Business Analyst', 'Project Manager'],
        skills_developed: ['Management', 'Communication', 'Project Management'],
        recommended_education: ['Diploma', "Bachelor's Degree"],
        experience_levels: ['Student / No experience', 'Fresher'],
        learning_modes: ['Video lessons', 'Live classes'],
        duration_weeks: 6
    }
];

(async () => {
    await connectPostgres();

    const existing = await query('SELECT COUNT(*) FROM course_finder_questions');
    if (Number(existing.rows[0].count) > 0) {
        console.log(`[Seed] course_finder_questions already has ${existing.rows[0].count} rows - skipping question seed.`);
    } else {
        for (let i = 0; i < QUESTIONS.length; i++) {
            const q = QUESTIONS[i];
            const qId = genId('cfq');
            await query(`
                INSERT INTO course_finder_questions (id, question, helper_text, category, type, required, display_order, config)
                VALUES ($1, $2, $3, $4, $5, true, $6, $7::jsonb)
            `, [qId, q.question, q.helperText, q.category, q.type, i + 1, JSON.stringify(q.config || {})]);

            for (let j = 0; j < q.answers.length; j++) {
                const a = q.answers[j];
                await query(`
                    INSERT INTO course_finder_answers (id, question_id, label, description, icon, display_order, mapping)
                    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
                `, [genId('cfa'), qId, a.label, a.description || null, a.icon || null, j + 1, JSON.stringify(a.mapping || {})]);
            }
            console.log(`[Seed] Created question ${i + 1}: ${q.question}`);
        }
    }

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
        console.log(`[Seed] Course metadata ${r.rowCount > 0 ? 'applied' : 'SKIPPED (course id not found)'}: ${c.id}`);
    }

    console.log('[Seed] Done.');
    process.exit(0);
})();
