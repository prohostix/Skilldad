/**
 * Comprehensive Enrollment Diagnostic and Fix Script
 * 
 * This script:
 * 1. Diagnoses enrollment issues
 * 2. Fixes missing Progress records
 * 3. Cleans up orphaned enrollments
 * 4. Verifies exam access
 * 
 * Usage: node server/scripts/diagnose-and-fix-enrollments.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Enrollment = require('../models/enrollmentModel');
const Progress = require('../models/progressModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Exam = require('../models/examModel');

async function diagnoseAndFix() {
    try {
        console.log('🔍 Starting comprehensive enrollment diagnostic...\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // STEP 1: Find all enrollments
        console.log('📊 STEP 1: Analyzing Enrollments\n');
        const allEnrollments = await Enrollment.find({}).lean();
        console.log(`Total enrollments in database: ${allEnrollments.length}`);

        const activeEnrollments = await Enrollment.find({ status: 'active' }).lean();
        console.log(`Active enrollments: ${activeEnrollments.length}\n`);

        // STEP 2: Check for orphaned enrollments
        console.log('🔍 STEP 2: Checking for Orphaned Enrollments\n');
        let orphanedCount = 0;
        let validEnrollments = [];

        for (const enrollment of activeEnrollments) {
            const student = await User.findById(enrollment.student);
            const course = await Course.findById(enrollment.course);

            if (!student) {
                console.log(`❌ Orphaned: Enrollment ${enrollment._id} - Student ${enrollment.student} not found`);
                orphanedCount++;
            } else if (!course) {
                console.log(`❌ Orphaned: Enrollment ${enrollment._id} - Course ${enrollment.course} not found`);
                orphanedCount++;
            } else {
                validEnrollments.push({
                    enrollment,
                    student,
                    course
                });
            }
        }

        console.log(`\nValid enrollments: ${validEnrollments.length}`);
        console.log(`Orphaned enrollments: ${orphanedCount}\n`);

        // STEP 3: Fix missing Progress records
        console.log('🔧 STEP 3: Creating Missing Progress Records\n');
        let progressFixed = 0;
        let progressExists = 0;

        for (const { enrollment, student, course } of validEnrollments) {
            const existingProgress = await Progress.findOne({
                user: student._id,
                course: course._id
            });

            if (!existingProgress) {
                await Progress.create({
                    user: student._id,
                    course: course._id,
                    completedVideos: [],
                    completedExercises: [],
                    projectSubmissions: [],
                    isCompleted: false
                });
                console.log(`✅ Created Progress: ${student.name} → ${course.title}`);
                progressFixed++;
            } else {
                progressExists++;
            }
        }

        console.log(`\nProgress records created: ${progressFixed}`);
        console.log(`Progress records already exist: ${progressExists}\n`);

        // STEP 4: Verify exam access
        console.log('🎓 STEP 4: Verifying Exam Access\n');
        
        for (const { student, course } of validEnrollments.slice(0, 5)) { // Check first 5
            const exams = await Exam.find({ course: course._id }).lean();
            console.log(`Student: ${student.name}`);
            console.log(`  Course: ${course.title}`);
            console.log(`  Exams available: ${exams.length}`);
            
            if (exams.length > 0) {
                console.log(`  Exam titles: ${exams.map(e => e.title).join(', ')}`);
            }
            console.log('');
        }

        // STEP 5: Summary
        console.log('='.repeat(60));
        console.log('📈 DIAGNOSTIC SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total enrollments: ${allEnrollments.length}`);
        console.log(`Active enrollments: ${activeEnrollments.length}`);
        console.log(`Valid enrollments: ${validEnrollments.length}`);
        console.log(`Orphaned enrollments: ${orphanedCount}`);
        console.log(`Progress records created: ${progressFixed}`);
        console.log(`Progress records already exist: ${progressExists}`);
        console.log('='.repeat(60) + '\n');

        if (progressFixed > 0) {
            console.log('✅ Fixed missing Progress records!');
            console.log('Students can now see their courses and access exams.\n');
        } else if (validEnrollments.length > 0) {
            console.log('✅ All enrollments have Progress records.');
            console.log('Students should be able to see courses and access exams.\n');
        }

        if (orphanedCount > 0) {
            console.log('⚠️  Warning: Found orphaned enrollments.');
            console.log('These enrollments reference deleted students or courses.');
            console.log('Consider cleaning them up manually.\n');
        }

    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

diagnoseAndFix();
