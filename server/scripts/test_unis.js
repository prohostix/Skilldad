const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skilldad-lms')
    .then(async () => {
        const User = require('./models/userModel');
        const unis = await User.find({ role: 'university' });
        unis.forEach(u => {
            console.log(`${u.name} | isVerified: ${u.isVerified} | profileImage: ${u.profileImage} | profile.profileImage: ${u.profile?.profileImage}`);
        });
        console.log('Done.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
