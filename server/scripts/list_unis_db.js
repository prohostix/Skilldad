const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

async function listUnis() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad');
        console.log('Connected to MongoDB');

        const unis = await User.find({ role: 'university' });
        console.log('Universities in DB:');
        unis.forEach(u => {
            console.log(`ID: ${u._id} | Name: ${u.name} | Image: ${u.profileImage}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listUnis();
