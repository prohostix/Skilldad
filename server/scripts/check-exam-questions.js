const mongoose = require('mongoose');
require('dotenv').config();

const Exam = require('../models/examModel');
const Question = require('../models/questionModel');

async function checkExamQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the REACT EXAM 2
    const exam = await Exam.findOne({ title: 'REACT EXAM 2' });
    if (!exam) {
      console.log('Exam not found');
      return;
    }

    console.log('\n=== EXAM INFO ===');
    console.log('ID:', exam._id);
    console.log('Title:', exam.title);
    console.log('Duration:', exam.duration);

    // Get questions for this exam
    const questions = await Question.find({ exam: exam._id }).sort({ order: 1 });
    
    console.log('\n=== QUESTIONS ===');
    console.log('Total questions:', questions.length);
    
    questions.forEach((q, idx) => {
      console.log(`\nQuestion ${idx + 1}:`);
      console.log('  ID:', q._id);
      console.log('  Question:', q.question);
      console.log('  Options:', q.options);
      console.log('  Marks:', q.marks);
      console.log('  Order:', q.order);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkExamQuestions();
