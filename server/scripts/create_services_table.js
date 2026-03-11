const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: process.env.PGSSL_CERT_PATH ? {
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, '../', process.env.PGSSL_CERT_PATH)).toString(),
    } : false
});

const servicesData = [
    {
        title: "Online Learning Platform",
        description: "Comprehensive e-learning solution with interactive courses, assessments, and progress tracking.",
        icon_name: "BookOpen",
        features: ["Interactive Courses", "Progress Tracking", "Assessments", "Certificates"],
        color_class: "text-purple-500",
        bg_class: "bg-purple-500/10",
        details: "Our flagship Online Learning Platform transforms traditional education into a digital-first, universally accessible experience for modern learners.",
        sub_services: [
            { title: "Custom Course Builder", desc: "Drag-and-drop structure for educators." },
            { title: "Automated Grading", desc: "Instant feedback on assignments and quizzes." },
            { title: "Discussion Forums", desc: "Built-in community engagement tools." }
        ],
        category: 'main',
        display_order: 1
    },
    {
        title: "Live Virtual Classes",
        description: "Real-time interactive sessions with expert instructors and collaborative learning environments.",
        icon_name: "Video",
        features: ["HD Video Streaming", "Interactive Whiteboard", "Screen Sharing", "Recording"],
        color_class: "text-emerald-500",
        bg_class: "bg-emerald-500/10",
        details: "Bridging the gap between online flexibility and in-person engagement, our Live Virtual Classes provide an immersive 'Studio Mode' experience.",
        sub_services: [
            { title: "Studio Interface", desc: "Premium layout with integrated chat & Q&A." },
            { title: "Cloud Recording", desc: "Auto-syncs recordings to the student dashboard." },
            { title: "Breakout Rooms", desc: "Facilitate small group discussions instantly." }
        ],
        category: 'main',
        display_order: 2
    },
    {
        title: "Corporate Training",
        description: "Customized training programs for businesses to upskill their workforce effectively.",
        icon_name: "Users",
        features: ["Custom Curriculum", "Team Management", "Analytics", "Bulk Enrollment"],
        color_class: "text-amber-500",
        bg_class: "bg-amber-500/10",
        details: "Empower your workforce with tailored curriculums designed to close skill gaps and align with your strategic business objectives.",
        sub_services: [
            { title: "B2B Dashboards", desc: "Track employee KPI and learning metrics." },
            { title: "Compliance Pathways", desc: "Mandatory training tracking and certification." },
            { title: "White-labeling", desc: "Train your team on a fully branded portal." }
        ],
        category: 'main',
        display_order: 3
    },
    {
        title: "AI-Powered Learning",
        description: "Personalized learning paths powered by artificial intelligence and machine learning.",
        icon_name: "Brain",
        features: ["Adaptive Learning", "Smart Recommendations", "Performance Analytics", "Skill Assessment"],
        color_class: "text-blue-500",
        bg_class: "bg-blue-500/10",
        details: "Leverage machine learning to create adaptive, highly personalized learning journeys that evolve with the student's pacing and proficiency.",
        sub_services: [
            { title: "Smart Tutor", desc: "24/7 AI chatbot assistance for course material." },
            { title: "Content Generation", desc: "AI-assisted quiz and assignment creation." },
            { title: "Predictive Analytics", desc: "Identify at-risk students before they fall behind." }
        ],
        category: 'main',
        display_order: 4
    },
    {
        title: "Internship Programs",
        description: "Connect students with real-world internship opportunities and hands-on industry experience.",
        icon_name: "Briefcase",
        features: ["Industry Partnerships", "Project-Based Learning", "Mentorship Support", "Experience Certificates"],
        color_class: "text-rose-500",
        bg_class: "bg-rose-500/10",
        details: "Bridge the gap between academia and industry. We guarantee practical exposure through structured, mentor-led virtual internship programs.",
        sub_services: [
            { title: "Live Projects", desc: "Work on real-world industry challenges." },
            { title: "Mentor Tracking", desc: "1-on-1 guidance from seasoned professionals." },
            { title: "Verified Credentials", desc: "Blockchain-backed experience letters." }
        ],
        category: 'main',
        display_order: 5
    },
    {
        title: "Placement Assessments",
        description: "Comprehensive evaluation and preparation for campus placements and job interviews.",
        icon_name: "ClipboardCheck",
        features: ["Mock Interviews", "Aptitude Tests", "Technical Assessments", "Career Guidance"],
        color_class: "text-teal-500",
        bg_class: "bg-teal-500/10",
        details: "Ensure your students are career-ready with rigorous, standard-aligned assessments mirroring tier-1 company recruitment drives.",
        sub_services: [
            { title: "Code Sandboxes", desc: "Live coding environments for technical tests." },
            { title: "AI Interviewer", desc: "Automated behavioral and technical mock interviews." },
            { title: "Detailed Scorecards", desc: "Granular feedback on specific competency areas." }
        ],
        category: 'main',
        display_order: 6
    },
    // Additional Features
    {
        title: "24/7 Support",
        description: "Round-the-clock technical and academic support for all users.",
        icon_name: "Headphones",
        color_class: "rose",
        category: 'additional',
        display_order: 7
    },
    {
        title: "Mobile Learning",
        description: "Learn on-the-go with our mobile-optimized platform and native apps.",
        icon_name: "Smartphone",
        color_class: "blue",
        category: 'additional',
        display_order: 8
    },
    {
        title: "Cloud Infrastructure",
        description: "Scalable and reliable cloud-based infrastructure for seamless learning.",
        icon_name: "Cloud",
        color_class: "indigo",
        category: 'additional',
        display_order: 9
    },
    {
        title: "Advanced Security",
        description: "Enterprise-grade security with data encryption and privacy protection.",
        icon_name: "Shield",
        color_class: "green",
        category: 'additional',
        display_order: 10
    },
    {
        title: "API Integration",
        description: "Seamless integration with existing systems through robust APIs.",
        icon_name: "Code",
        color_class: "orange",
        category: 'additional',
        display_order: 11
    },
    {
        title: "Analytics Dashboard",
        description: "Comprehensive analytics and reporting for insights and decision-making.",
        icon_name: "Database",
        color_class: "cyan",
        category: 'additional',
        display_order: 12
    }
];

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Starting Services table migration...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                icon_name TEXT,
                features JSONB DEFAULT '[]'::jsonb,
                color_class TEXT,
                bg_class TEXT,
                details TEXT,
                sub_services JSONB DEFAULT '[]'::jsonb,
                category TEXT DEFAULT 'main',
                is_active BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Table "services" created or already exists.');

        // Clear existing to avoid duplicates if re-running
        await client.query('DELETE FROM services');
        
        for (const service of servicesData) {
            await client.query(`
                INSERT INTO services (
                    title, description, icon_name, features, 
                    color_class, bg_class, details, sub_services, 
                    category, display_order
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                service.title,
                service.description,
                service.icon_name,
                JSON.stringify(service.features || []),
                service.color_class,
                service.bg_class,
                service.details,
                JSON.stringify(service.sub_services || []),
                service.category,
                service.display_order
            ]);
        }
        
        console.log(`Seeded ${servicesData.length} services.`);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
