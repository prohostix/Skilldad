const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/userModel');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const checkCit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const universities = await User.find({ role: 'university' });
        console.log('Universities in DB:');
        universities.forEach(u => {
            console.log(`Name: ${u.name}, Verified: ${u.isVerified}, ProfileImage: ${u.profileImage}, Location: ${u.profile?.location}`);
        });
        const cit = await User.findOne({ name: /CIT/i });
        if (cit) {
            console.log('\nCIT Detailed:');
            console.log(JSON.stringify(cit, null, 2));
        } else {
            console.log('\nCIT not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCit();
