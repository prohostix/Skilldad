/**
 * Fix ALL Students - Ensure Progress Records Exist
 * 
 * This ensures every student with an active enrollment
 * has a corresponding Progress record so they can see
 * their courses and access exams.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Enrollment = require('../models/enrollmentModel');
const Progress = require('../models/progressModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');

async function fixAllStudents() {
    try {
        console.log('🔧 Fixing ALL student enrollments...\n');

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get all active enrollments with populated data
        const enrollments = await Enrollment.find({ status: 'active' })
            .populate('student')
            .populate('course');

        console.log(`📊 Found ${enrollments.length} active enrollments\n`);

        let fixed = 0;
        let alreadyExists = 0;
        let errors = 0;

        for (const enrollment of enrollments) {
            try {
                if (!enrollment.student || !enrollment.course) {
                    console.log(`⚠️  Skipping - missing student or course`);
                    continue;
                }

                const studentName = enrollment.student.name;
                const courseName = enrollment.course.title;

                // Check if Progress exists
                const existingProgress = await Progress.findOne({
                    user: enrollment.student._id,
                    course: enrollment.course._id
                });

                if (!existingProgress) {
                    // Create Progress record
                    await Progress.create({
                        user: enrollment.student._id,
                        course: enrollment.course._id,
                        completedVideos: [],
                        completedExercises: [],
                        projectSubmissions: [],
                        isCompleted: false
                    });
                    console.log(`✅ FIXED: ${studentName} → ${courseName}`);
                    fixed++;
                } else {
                    console.log(`✓ OK: ${studentName} → ${courseName}`);
                    alreadyExists++;
                }

            } catch (err) {
                console.error(`❌ Error:`, err.message);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total enrollments: ${enrollments.length}`);
        console.log(`✅ Fixed (Progress created): ${fixed}`);
        console.log(`✓ Already OK: ${alreadyExists}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('='.repeat(60) + '\n');

        if (fixed > 0) {
            console.log(`🎉 SUCCESS! Fixed ${fixed} students.`);
            console.log('All students can now access their courses and exams!\n');
        } else {
            console.log('✅ All students already have access!\n');
        }

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

fixAllStudents();
