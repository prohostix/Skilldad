require('dotenv').config({ path: '../.env' });
const { query, connectPostgres } = require('../config/postgres');

const newFaqs = [
    {
        question: "What is the SkillDad platform?",
        answer: "SkillDad is an advanced digital learning ecosystem connecting students with global universities and industry professionals. We offer interactive courses, live sessions, certification programs, and career placement services, all integrated with a rewarding gamified learning experience.",
        category: "General"
    },
    {
        question: "How do the Reward Points work?",
        answer: "You earn Reward Points by completing modules, participating in live classes, performing well in exams, and referring friends. These points are stored in your Reward Wallet and can be redeemed for course discounts, exclusive webinars, and specialized study materials.",
        category: "Rewards"
    },
    {
        question: "Can I get a job through SkillDad's Vacancy portal?",
        answer: "Yes! SkillDad collaborates with leading corporate partners to offer exclusive placement opportunities. You can browse job vacancies directly in your dashboard, apply through the portal, and receive real-time notifications when an employer reviews your profile.",
        category: "Placements"
    },
    {
        question: "Are the certificates accredited by recognized universities?",
        answer: "Absolutely. Many of our advanced programs are provided in direct partnership with accredited global universities. Upon successful completion of these specific courses, you receive an official, verifiable certification from the partner institution.",
        category: "Courses"
    },
    {
        question: "How do I access Live Classes?",
        answer: "Live Classes are scheduled by your instructors and can be accessed directly from your Student Dashboard. Ensure you are enrolled in the corresponding course, and you will see an 'Access Live Class' button 15 minutes before the session starts.",
        category: "Live Classes"
    },
    {
        question: "What is the referral program?",
        answer: "Our referral program allows you to invite friends to join SkillDad using your unique referral code. When a friend signs up and enrolls in a paid course, both you and your friend receive a substantial bonus in Reward Points in your wallets.",
        category: "Rewards"
    },
    {
        question: "How are the online exams conducted?",
        answer: "Online exams are integrated directly into our platform. Depending on the course, they may involve multiple-choice questions, interactive learning environments, or written submissions. All exams are timed and securely submitted upon completion.",
        category: "Exams"
    },
    {
        question: "Can I access my learning materials offline?",
        answer: "Currently, downloading full interactive modules or videos is disabled to protect proprietary resources. However, you can download specific course brochures, PDF syllabuses, and certain supplementary reading materials for offline studying.",
        category: "General"
    },
    {
        question: "How do I update my profile or bank details for payouts?",
        answer: "Navigate to your Account Settings via the dashboard dropdown menu. Under 'Financial Details', you can securely update your bank account or payment information. Payouts for partner universities and affiliates are processed securely via these details.",
        category: "Account"
    },
    {
        question: "What should I do if I experience a technical issue?",
        answer: "If you face any technical difficulties, you can click on the floating AI Chatbot at the bottom right of your screen for immediate guidance. If the chatbot cannot resolve your issue, it will direct you to lodge a support ticket with our 24/7 technical team.",
        category: "General"
    }
];

async function seedFaqs() {
    try {
        await connectPostgres();
        console.log('Seeding FAQs into database...');
        let inserted = 0;
        for (const faq of newFaqs) {
            // Check if already exists to prevent duplicate seeding
            const existing = await query('SELECT id FROM faqs WHERE question = $1', [faq.question]);
            if (existing.rows.length === 0) {
                await query('INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3)', [faq.question, faq.answer, faq.category]);
                inserted++;
            }
        }
        console.log(`Successfully added ${inserted} new FAQs!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding FAQs:', error);
        process.exit(1);
    }
}

seedFaqs();
