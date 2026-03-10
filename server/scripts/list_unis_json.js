const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

async function listUnis() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldad');
        const unis = await User.find({ role: 'university' }).select('name profileImage');
        console.log(JSON.stringify(unis, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listUnis();
