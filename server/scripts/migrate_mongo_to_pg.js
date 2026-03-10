const mongoose = require('mongoose');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const BATCH_SIZE = 100;

// PostgreSQL Pool
const pgPool = new Pool({
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

async function migrate() {
    try {
        console.log('--- Starting MongoDB to PostgreSQL Migration ---');

        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 2. Initialize PostgreSQL Schema
        console.log('Initializing PostgreSQL schema...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pgPool.query(schema);
        console.log('Schema initialized.');

        // 3. Migration Order (Dependencies first)
        const entities = [
            { name: 'User', model: require('../models/userModel'), table: 'users' },
            { name: 'Course', model: require('../models/courseModel'), table: 'courses' },
            { name: 'Exam', model: require('../models/examModel'), table: 'exams' },
            { name: 'Question', model: require('../models/questionModel'), table: 'questions' },
            { name: 'Enrollment', model: require('../models/enrollmentModel'), table: 'enrollments' },
            { name: 'ExamSubmission', model: require('../models/examSubmissionNewModel'), table: 'exam_submissions_new' },
            { name: 'Result', model: require('../models/resultModel'), table: 'results' },
            { name: 'InteractiveContent', model: require('../models/interactiveContentModel'), table: 'interactive_contents' },
            { name: 'Payment', model: require('../models/paymentModel'), table: 'transactions' }, // Mapping Payment to transactions
            { name: 'Payout', model: require('../models/payoutModel'), table: 'payouts' },
            { name: 'ProjectSubmission', model: require('../models/projectSubmissionModel'), table: 'projects' },
            { name: 'Document', model: require('../models/documentModel'), table: 'documents' },
            { name: 'LiveSession', model: require('../models/liveSessionModel'), table: 'live_sessions' },
            { name: 'Submission', model: require('../models/submissionModel'), table: 'submissions' },
            { name: 'Discount', model: require('../models/discountModel'), table: 'discounts' },
            { name: 'AuditLog', model: require('../models/auditLogModel'), table: 'audit_logs' }
        ];

        for (const entity of entities) {
            await migrateEntity(entity);
        }

        console.log('\n--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration Failed:', error);
        process.exit(1);
    }
}

async function migrateEntity({ name, model, table }) {
    console.log(`\nMigrating ${name}...`);
    
    const count = await model.countDocuments();
    if (count === 0) {
        console.log(`No documents found for ${name}. Skipping.`);
        return;
    }

    console.log(`Found ${count} documents.`);
    
    let migrated = 0;
    for (let i = 0; i < count; i += BATCH_SIZE) {
        const docs = await model.find().skip(i).limit(BATCH_SIZE).lean();
        
        for (const doc of docs) {
            try {
                const sqlData = transformData(name, doc);
                if (!sqlData) continue;

                const columns = Object.keys(sqlData).map(k => `"${k}"`).join(', ');
                const values = Object.values(sqlData);
                const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');

                const upsertClause = Object.keys(sqlData)
                    .filter(k => k !== 'id')
                    .map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');

                await pgPool.query(`
                    INSERT INTO ${table} (${columns})
                    VALUES (${placeholders})
                    ON CONFLICT (id) DO UPDATE SET ${upsertClause}, updated_at = NOW()
                `, values);
                
                migrated++;
            } catch (err) {
                console.error(`Failed to migrate ${name} ID ${doc._id}:`, err.message);
            }
        }
        process.stdout.write(`Progress: ${migrated}/${count}\r`);
    }
    console.log(`\nSuccessfully migrated ${migrated} ${name}(s).`);
}

function transformData(entityName, doc) {
    const base = {
        id: doc._id.toString(),
        created_at: doc.createdAt || doc.created_at || new Date(),
        updated_at: doc.updatedAt || doc.updated_at || new Date()
    };

    switch (entityName) {
        case 'User':
            return {
                ...base,
                name: doc.name,
                email: doc.email.toLowerCase().trim(),
                password: doc.password,
                role: doc.role,
                bio: doc.bio,
                profile_image: doc.profileImage,
                profile: JSON.stringify(doc.profile || {}),
                university_id: doc.universityId ? doc.universityId.toString() : null,
                registered_by: doc.registeredBy ? doc.registeredBy.toString() : null,
                partner_code: doc.partnerCode,
                is_verified: doc.isVerified || false,
                discount_rate: doc.discountRate || 0,
                reset_password_token: doc.resetPasswordToken,
                reset_password_expire: doc.resetPasswordExpire
            };
        case 'Course':
            return {
                ...base,
                title: doc.title,
                description: doc.description,
                thumbnail: doc.thumbnail,
                category: doc.category,
                price: doc.price || 0,
                instructor_id: doc.instructor ? doc.instructor.toString() : null,
                instructor_name: doc.instructorName,
                university_name: doc.universityName,
                modules: JSON.stringify(doc.modules || []),
                projects: JSON.stringify(doc.projects || []),
                is_published: doc.isPublished || false
            };
        case 'Enrollment':
            return {
                ...base,
                student_id: doc.student.toString(),
                course_id: doc.course.toString(),
                enrollment_date: doc.enrollmentDate || doc.createdAt,
                status: doc.status,
                progress: doc.progress || 0,
                completed_modules: doc.completedModules || 0,
                total_modules: doc.totalModules || 0,
                completed_videos: JSON.stringify(doc.completedVideos || []),
                completed_exercises: JSON.stringify(doc.completedExercises || []),
                grade: doc.grade,
                final_score: doc.finalScore,
                certificate_issued: doc.certificateIssued || false,
                certificate_url: doc.certificateUrl
            };
        case 'Exam':
            return {
                ...base,
                title: doc.title,
                description: doc.description,
                course_id: doc.course.toString(),
                university_id: doc.university.toString(),
                created_by_id: doc.createdBy.toString(),
                exam_type: doc.examType,
                is_mock_exam: doc.isMockExam || false,
                scheduled_start: doc.scheduledStartTime,
                scheduled_end: doc.scheduledEndTime,
                duration: doc.duration,
                question_paper_url: doc.questionPaperUrl,
                allow_late_submission: doc.allowLateSubmission || false,
                late_submission_deadline: doc.lateSubmissionDeadline,
                status: doc.status,
                results_published: doc.resultsPublished || false,
                published_at: doc.publishedAt,
                shuffle_questions: doc.shuffleQuestions || false,
                show_results_immediately: doc.showResultsImmediately || false,
                passing_score: doc.passingScore || 40,
                total_marks: doc.totalMarks || 0,
                instructions: doc.instructions
            };
        case 'Question':
            return {
                ...base,
                exam_id: doc.examId ? doc.examId.toString() : (doc.exam ? doc.exam.toString() : null),
                question_type: doc.questionType,
                question_text: doc.questionText,
                question_image: doc.questionImage,
                options: JSON.stringify(doc.options || []),
                marks: doc.marks || 0,
                negative_marks: doc.negativeMarks || 0,
                "order": doc.order || 0,
                difficulty: doc.difficulty || 'medium',
                tags: JSON.stringify(doc.tags || [])
            };
        case 'ExamSubmission':
            return {
                ...base,
                exam_id: doc.examId.toString(),
                student_id: doc.studentId.toString(),
                started_at: doc.startedAt,
                submitted_at: doc.submittedAt,
                status: doc.status,
                answers: JSON.stringify(doc.answers || []),
                total_marks: doc.totalMarks || 0,
                obtained_marks: doc.obtainedMarks,
                percentage: doc.percentage,
                grade: doc.grade
            };
        case 'Result':
            return {
                ...base,
                exam_id: doc.examId.toString(),
                student_id: doc.studentId.toString(),
                submission_id: doc.submissionId.toString(),
                total_marks: doc.totalMarks,
                obtained_marks: doc.obtainedMarks,
                percentage: doc.percentage,
                grade: doc.grade,
                is_passed: doc.isPassed,
                rank: doc.rank
            };
        case 'InteractiveContent':
            return {
                ...base,
                type: doc.type,
                title: doc.title,
                description: doc.description,
                instructions: doc.instructions,
                time_limit: doc.timeLimit,
                attempts_allowed: doc.attemptsAllowed,
                passing_score: doc.passingScore,
                show_solution_after: doc.showSolutionAfter,
                questions: JSON.stringify(doc.questions || []),
                course_id: doc.courseId ? doc.courseId.toString() : null,
                module_id: doc.moduleId ? doc.moduleId.toString() : null
            };
        case 'Payment':
            return {
                ...base,
                user_id: doc.student.toString(),
                amount: doc.amount,
                currency: 'INR',
                status: doc.status === 'approved' ? 'completed' : (doc.status === 'rejected' ? 'failed' : 'pending'),
                provider: doc.paymentMethod,
                provider_order_id: doc.transactionId,
                provider_payment_id: doc.transactionId
            };
        case 'Payout':
            return {
                ...base,
                partner_id: doc.partnerId ? doc.partnerId.toString() : doc.partner.toString(),
                amount: doc.amount,
                status: doc.status,
                notes: doc.notes,
                screenshot_url: doc.screenshotUrl,
                request_date: doc.requestDate,
                payout_date: doc.payoutDate,
                reviewed_by: doc.reviewedBy ? doc.reviewedBy.toString() : null,
                reviewed_at: doc.reviewedAt
            };
        case 'ProjectSubmission':
            return {
                ...base,
                student_id: doc.student.toString(),
                course_id: doc.course.toString(),
                title: doc.title,
                description: doc.description,
                file_url: doc.fileUrl,
                github_url: doc.githubUrl,
                status: doc.status,
                submission_date: doc.submissionDate || doc.createdAt
            };
        case 'Document':
            return {
                ...base,
                user_id: doc.user.toString(),
                title: doc.title,
                file_url: doc.fileUrl,
                file_type: doc.fileType,
                status: doc.status
            };
        case 'LiveSession':
            return {
                ...base,
                topic: doc.topic,
                description: doc.description,
                start_time: doc.startTime,
                duration: doc.duration,
                timezone: doc.timezone,
                instructor_id: doc.instructor ? doc.instructor.toString() : null,
                university_id: doc.university ? doc.university.toString() : null,
                course_id: doc.course ? doc.course.toString() : null,
                status: doc.status
            };
        case 'Submission':
            return {
                ...base,
                user_id: doc.user.toString(),
                course_id: doc.course.toString(),
                module_id: doc.moduleId ? doc.moduleId.toString() : null,
                content_id: doc.contentId ? doc.contentId.toString() : null,
                content_type: doc.contentType,
                answers: JSON.stringify(doc.answers || []),
                score: doc.score,
                status: doc.status,
                attempt_number: doc.attemptNumber || 1,
                started_at: doc.startedAt,
                submitted_at: doc.submittedAt
            };
        case 'Discount':
            return {
                ...base,
                code: doc.code,
                value: doc.value,
                type: doc.type,
                partner_id: doc.partnerId ? doc.partnerId.toString() : (doc.partner ? doc.partner.toString() : null),
                active: doc.active !== false
            };
        case 'AuditLog':
            return {
                ...base,
                user_id: doc.userId ? doc.userId.toString() : null,
                action: doc.action,
                resource: doc.resource,
                resource_id: doc.resourceId ? doc.resourceId.toString() : null,
                details: JSON.stringify(doc.details || {}),
                ip_address: doc.ipAddress,
                user_agent: doc.userAgent
            };
        default:
            return null;
    }
}

migrate();
