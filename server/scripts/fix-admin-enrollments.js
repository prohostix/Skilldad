/**
 * Migration Script: Fix Admin Enrollments
 * 
 * This script creates missing Progress records for students who were enrolled by admin
 * but don't have Progress records, causing them to not see courses in "My Courses".
 * 
 * Run this script once to fix all existing admin enrollments.
 * 
 * Usage: node server/scripts/fix-admin-enrollments.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Import models
const Enrollment = require('../models/enrollmentModel');
const Progress = require('../models/progressModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');

async function fixAdminEnrollments() {
    try {
        console.log('🔧 Starting admin enrollment fix...\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find all active enrollments
        const enrollments = await Enrollment.find({ status: 'active' })
            .populate('student', 'name email')
            .populate('course', 'title')
            .lean();

        console.log(`📊 Found ${enrollments.length} active enrollments\n`);

        let fixedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Process each enrollment
        for (const enrollment of enrollments) {
            try {
                if (!enrollment.student || !enrollment.course) {
                    console.log(`⚠️  Skipping enrollment ${enrollment._id} - missing student or course`);
                    skippedCount++;
                    continue;
                }

                // Check if Progress record exists
                const existingProgress = await Progress.findOne({
                    user: enrollment.student._id,
                    course: enrollment.course._id
                });

                if (existingProgress) {
                    // Progress record already exists, skip
                    skippedCount++;
                    continue;
                }

                // Create missing Progress record
                await Progress.create({
                    user: enrollment.student._id,
                    course: enrollment.course._id,
                    completedVideos: [],
                    completedExercises: [],
                    projectSubmissions: [],
                    isCompleted: false
                });

                fixedCount++;
                console.log(`✅ Fixed: ${enrollment.student.name} → ${enrollment.course.title}`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error processing enrollment ${enrollment._id}:`, error.message);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total enrollments processed: ${enrollments.length}`);
        console.log(`✅ Fixed (Progress records created): ${fixedCount}`);
        console.log(`⏭️  Skipped (Progress already exists): ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(60) + '\n');

        if (fixedCount > 0) {
            console.log('🎉 Migration completed successfully!');
            console.log('Students can now see their courses in "My Courses" panel.\n');
        } else {
            console.log('ℹ️  No missing Progress records found. All enrollments are already fixed.\n');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the migration
fixAdminEnrollments();
