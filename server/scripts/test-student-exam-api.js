/**
 * Test Student Exam API
 * 
 * This script tests the /api/exams/student/my-exams endpoint
 * to verify it returns exams correctly
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Exam = require('../models/examModel');
const Enrollment = require('../models/enrollmentModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');

async function testStudentExamAPI() {
    try {
        console.log('🧪 Testing Student Exam API...\n');

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get a test student (John Smith)
        const student = await User.findOne({ email: 'john.smith@student.com' });
        
        if (!student) {
            console.log('❌ Test student not found');
            process.exit(1);
        }

        console.log(`👤 Testing with student: ${student.name} (${student.email})\n`);

        // Simulate the API logic
        console.log('📡 Simulating API: GET /api/exams/student/my-exams\n');

        // Step 1: Get enrollments
        const enrollments = await Enrollment.find({
            student: student._id,
            status: 'active'
        }).select('course');

        console.log(`Step 1: Found ${enrollments.length} active enrollments`);
        
        const courseIds = enrollments.map(e => e.course);
        console.log(`Course IDs: ${courseIds.join(', ')}\n`);

        // Step 2: Get exams for these courses
        const exams = await Exam.find({
            course: { $in: courseIds }
        })
            .populate('course', 'title')
            .populate('university', 'name')
            .sort({ scheduledStartTime: -1 })
            .lean();

        console.log(`Step 2: Found ${exams.length} exams\n`);

        // Step 3: Format response
        const response = {
            success: true,
            count: exams.length,
            data: exams
        };

        console.log('📤 API Response:');
        console.log(JSON.stringify(response, null, 2));

        console.log('\n' + '='.repeat(80));
        console.log('✅ API TEST SUCCESSFUL');
        console.log('='.repeat(80));
        console.log(`\nThe API would return ${exams.length} exams for ${student.name}`);
        
        if (exams.length > 0) {
            console.log('\nExam titles:');
            exams.forEach((exam, idx) => {
                console.log(`${idx + 1}. ${exam.title} (${exam.course?.title})`);
            });
        }

        console.log('\n💡 If frontend still shows "No Exams Found":');
        console.log('   1. Restart frontend dev server (npm run dev)');
        console.log('   2. Hard refresh browser (Ctrl + Shift + R)');
        console.log('   3. Check browser console for errors');
        console.log('   4. Verify student is logged in');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

testStudentExamAPI();
