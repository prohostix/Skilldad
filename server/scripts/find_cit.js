const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

async function checkCIT() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad');
        const uni = await User.findOne({ name: /CIT/i });
        if (uni) {
            console.log('CIT University Found:');
            console.log('ID:', uni._id);
            console.log('Image:', uni.profileImage);
        } else {
            console.log('CIT University not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCIT();
