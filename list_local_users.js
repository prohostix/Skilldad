const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./server/models/userModel');
        const users = await User.find().select('name email role');
        console.log(`Total local users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

listUsers();
