const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

async function checkUni() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad');
        console.log('Connected to MongoDB');

        const uni = await User.findById('69a13f92ec3aff62fcfe9c4e');
        if (uni) {
            console.log('University Found:');
            console.log('Name:', uni.name);
            console.log('Profile Image:', uni.profileImage);
            console.log('Profile:', JSON.stringify(uni.profile, null, 2));
        } else {
            console.log('University not found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUni();
