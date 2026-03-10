/**
 * Check specific students: Rinsna and John
 * Enrolled in: Complete React Development Bootcamp
 * University: Sara Wilson
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Enrollment = require('../models/enrollmentModel');
const Progress = require('../models/progressModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Exam = require('../models/examModel');

async function checkStudents() {
    try {
        console.log('🔍 Checking Rinsna and John enrollment status...\n');

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find students by name
        const students = await User.find({
            name: { $in: [/rinsna/i, /john/i] },
            role: 'student'
        }).lean();

        console.log(`Found ${students.length} students:\n`);
        students.forEach(s => {
            console.log(`  - ${s.name} (${s.email}) - ID: ${s._id}`);
        });
        console.log('');

        // Find Complete React course
        const reactCourse = await Course.findOne({
            title: /complete react/i
        }).lean();

        if (!reactCourse) {
            console.log('❌ Complete React course not found!\n');
            process.exit(1);
        }

        console.log(`📚 Course: ${reactCourse.title} - ID: ${reactCourse._id}\n`);

        // Find Sara Wilson university
        const saraWilson = await User.findOne({
            name: /sara wilson/i,
            role: 'university'
        }).lean();

        if (saraWilson) {
            console.log(`🏛️  University: ${saraWilson.name} - ID: ${saraWilson._id}\n`);
        }

        // Check enrollments for each student
        for (const student of students) {
            console.log('='.repeat(60));
            console.log(`Checking: ${student.name}`);
            console.log('='.repeat(60));

            // Check enrollment
            const enrollment = await Enrollment.findOne({
                student: student._id,
                course: reactCourse._id
            }).lean();

            if (enrollment) {
                console.log(`✅ Enrollment exists`);
                console.log(`   Status: ${enrollment.status}`);
                console.log(`   Enrolled: ${enrollment.enrollmentDate}`);
            } else {
                console.log(`❌ NO ENROLLMENT FOUND`);
            }

            // Check progress
            const progress = await Progress.findOne({
                user: student._id,
                course: reactCourse._id
            }).lean();

            if (progress) {
                console.log(`✅ Progress record exists`);
                console.log(`   Completed videos: ${progress.completedVideos?.length || 0}`);
            } else {
                console.log(`❌ NO PROGRESS RECORD FOUND`);
            }

            // Check exams for this course
            const exams = await Exam.find({
                course: reactCourse._id
            }).lean();

            console.log(`\n📝 Exams for this course: ${exams.length}`);
            if (exams.length > 0) {
                exams.forEach(exam => {
                    console.log(`   - ${exam.title} (${exam.status})`);
                    console.log(`     Start: ${exam.scheduledStartTime}`);
                    console.log(`     End: ${exam.scheduledEndTime}`);
                });
            }

            // Check what getStudentExams would return
            if (enrollment && enrollment.status === 'active') {
                console.log(`\n✅ Student SHOULD see ${exams.length} exams`);
            } else if (!enrollment) {
                console.log(`\n❌ Student CANNOT see exams - NO ENROLLMENT`);
            } else {
                console.log(`\n❌ Student CANNOT see exams - Enrollment status: ${enrollment.status}`);
            }

            console.log('');
        }

        console.log('='.repeat(60));
        console.log('DIAGNOSIS COMPLETE');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

checkStudents();
