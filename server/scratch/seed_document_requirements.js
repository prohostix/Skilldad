const dotenv = require('dotenv');
const path = require('path');
const { connectPostgres, query } = require('../config/postgres');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedRequirements = async () => {
    try {
        await connectPostgres();
        console.log('Database connected for seeding...');

        // 1. Get all students
        const studentsRes = await query("SELECT id, name FROM users WHERE role = 'student'");
        console.log(`Found ${studentsRes.rows.length} students.`);

        if (studentsRes.rows.length === 0) {
            console.log('No students found to seed documents for.');
            process.exit(0);
        }

        const requirements = [
            {
                title: "Official Identity Proof",
                description: "Primary government-issued identification (Passport, National ID, or Driving License).",
                type: "identity",
                is_required: true,
                deadline: '2026-12-31'
            },
            {
                title: "Previous Academic Transcript",
                description: "Highest degree or diploma certificate obtained from your previous institution.",
                type: "academic",
                is_required: true,
                deadline: '2026-12-31'
            },
            {
                title: "Updated Professional CV",
                description: "Current resume/CV highlighting your skills and experience for the placement portal.",
                type: "portfolio",
                is_required: false,
                deadline: '2026-12-31'
            }
        ];

        let count = 0;
        for (const student of studentsRes.rows) {
            for (const req of requirements) {
                // Check if already exists
                const existing = await query(
                    "SELECT id FROM documents WHERE student_id = $1 AND title = $2",
                    [student.id, req.title]
                );

                if (existing.rows.length === 0) {
                    const docId = `doc_req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    await query(`
                        INSERT INTO documents (
                            id, title, description, type, format, file_size, status, is_required, deadline, 
                            student_id, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, NOW(), NOW())
                    `, [
                        docId, req.title, req.description, req.type, 'PDF', 0,
                        req.is_required, req.deadline, student.id
                    ]);
                    count++;
                }
            }
        }

        console.log(`Successfully seeded ${count} document requirements for students.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedRequirements();
