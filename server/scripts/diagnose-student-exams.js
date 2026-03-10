/**
 * Diagnose Student Exam Access Issues
 * 
 * This script checks:
 * 1. If exams exist in the database
 * 2. If students are enrolled in courses
 * 3. If students should see exams based on enrollment
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Exam = require('../models/examModel');
const Enrollment = require('../models/enrollmentModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');

async function diagnoseStudentExams() {
    try {
        console.log('🔍 Diagnosing Student Exam Access...\n');

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check all exams
        const allExams = await Exam.find()
            .populate('course', 'title')
            .populate('university', 'name')
            .lean();
        
        console.log('📊 TOTAL EXAMS IN DATABASE:', allExams.length);
        if (allExams.length > 0) {
            console.log('\nExam Details:');
            allExams.forEach((exam, idx) => {
                console.log(`${idx + 1}. ${exam.title}`);
                console.log(`   Course: ${exam.course?.title || 'N/A'}`);
                console.log(`   University: ${exam.university?.name || 'N/A'}`);
                console.log(`   Status: ${exam.status}`);
                console.log(`   Start: ${exam.scheduledStartTime}`);
                console.log(`   End: ${exam.scheduledEndTime}`);
                console.log('');
            });
        }

        // 2. Check all students
        const students = await User.find({ role: 'student' }).select('name email').lean();
        console.log('\n📊 TOTAL STUDENTS:', students.length);

        // 3. Check enrollments
        const enrollments = await Enrollment.find({ status: 'active' })
            .populate('student', 'name email')
            .populate('course', 'title')
            .lean();
        
        console.log('\n📊 TOTAL ACTIVE ENROLLMENTS:', enrollments.length);

        // 4. For each student, check what exams they should see
        console.log('\n' + '='.repeat(80));
        console.log('STUDENT EXAM ACCESS ANALYSIS');
        console.log('='.repeat(80));

        for (const student of students) {
            console.log(`\n👤 Student: ${student.name} (${student.email})`);
            
            // Get student's enrollments
            const studentEnrollments = enrollments.filter(
                e => e.student && e.student._id.toString() === student._id.toString()
            );
            
            console.log(`   Enrolled in ${studentEnrollments.length} course(s):`);
            
            if (studentEnrollments.length === 0) {
                console.log('   ⚠️  NOT ENROLLED IN ANY COURSES');
                continue;
            }

            const courseIds = studentEnrollments.map(e => e.course._id.toString());
            
            studentEnrollments.forEach(e => {
                console.log(`   - ${e.course?.title || 'Unknown Course'}`);
            });

            // Find exams for these courses
            const studentExams = allExams.filter(exam => 
                courseIds.includes(exam.course?._id?.toString())
            );

            console.log(`   Should see ${studentExams.length} exam(s):`);
            
            if (studentExams.length === 0) {
                console.log('   ⚠️  NO EXAMS SCHEDULED FOR ENROLLED COURSES');
            } else {
                studentExams.forEach(exam => {
                    console.log(`   ✅ ${exam.title} (${exam.course?.title})`);
                });
            }
        }

        // 5. Check API endpoint logic
        console.log('\n' + '='.repeat(80));
        console.log('API ENDPOINT SIMULATION');
        console.log('='.repeat(80));

        if (students.length > 0) {
            const testStudent = students[0];
            console.log(`\nSimulating API call for: ${testStudent.name}`);

            // Simulate getStudentExams logic
            const studentEnrollments = await Enrollment.find({
                student: testStudent._id,
                status: 'active'
            }).select('course');

            const courseIds = studentEnrollments.map(e => e.course);
            console.log(`Student enrolled in ${courseIds.length} courses`);

            const exams = await Exam.find({
                course: { $in: courseIds }
            })
                .populate('course', 'title')
                .populate('university', 'name')
                .lean();

            console.log(`API would return ${exams.length} exams`);
            
            if (exams.length > 0) {
                console.log('\nExams that would be returned:');
                exams.forEach(exam => {
                    console.log(`- ${exam.title} (${exam.course?.title})`);
                });
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('DIAGNOSIS COMPLETE');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

diagnoseStudentExams();
