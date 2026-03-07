/**
 * URGENT FIX: Create Progress records for existing enrollments
 * Run this from the root directory: node fix-enrollments-now.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Define schemas inline to avoid import issues
const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.T