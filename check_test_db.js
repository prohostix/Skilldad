const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const checkTestDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/skilldad_test');
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        console.log(`Users in skilldad_test: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkTestDB();
