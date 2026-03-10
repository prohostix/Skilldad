const mongoose = require('mongoose');
require('dotenv').config();

const Question = require('../models/questionModel');

async function addSampleQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const examId = '69aa71c3f9e11ebb464a95ee'; // REACT EXAM 2

    // Sample React questions
    const sampleQuestions = [
      {
        questionText: 'What is the correct way to create a functional component in React?',
        options: [
          { text: 'function MyComponent() { return <div>Hello</div>; }', isCorrect: true },
          { text: 'class MyComponent extends Component { }', isCorrect: false },
          { text: 'const MyComponent = <div>Hello</div>;', isCorrect: false },
          { text: 'React.createComponent("MyComponent")', isCorrect: false }
        ]
      },
      {
        questionText: 'Which hook is used to manage state in functional components?',
        options: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false }
        ]
      },
      {
        questionText: 'What does JSX stand for?',
        options: [
          { text: 'JavaScript XML', isCorrect: true },
          { text: 'Java Syntax Extension', isCorrect: false },
          { text: 'JavaScript Extension', isCorrect: false },
          { text: 'Java XML', isCorrect: false }
        ]
      },
      {
        questionText: 'How do you pass data from parent to child component?',
        options: [
          { text: 'Using state', isCorrect: false },
          { text: 'Using props', isCorrect: true },
          { text: 'Using context', isCorrect: false },
          { text: 'Using refs', isCorrect: false }
        ]
      }
    ];

    // Get existing question IDs
    const existingQuestions = await Question.find({ exam: examId }).sort({ order: 1 });
    
    if (existingQuestions.length !== 4) {
      console.log('Error: Expected 4 questions, found', existingQuestions.length);
      return;
    }

    console.log('\nUpdating questions with sample content...\n');

    for (let i = 0; i < existingQuestions.length; i++) {
      const question = existingQuestions[i];
      const sampleData = sampleQuestions[i];

      await Question.findByIdAndUpdate(question._id, {
        questionText: sampleData.questionText,
        options: sampleData.options,
        questionType: 'mcq'
      });

      console.log(`Updated Question ${i + 1}:`);
      console.log('  Text:', sampleData.questionText);
      console.log('  Options:', sampleData.options.length);
    }

    console.log('\n✅ All questions updated successfully!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleQuestions();
