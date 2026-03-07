const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/userModel');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkCit = async () => {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGO_URI);
        output += 'Connected to DB\n';
        const universities = await User.find({ role: 'university' });
        output += `Universities in DB count: ${universities.length}\n`;
        universities.forEach(u => {
            output += `Name: ${u.name}, Verified: ${u.isVerified}, ProfileImage: ${u.profileImage}, Location: ${u.profile?.location}\n`;
        });
        const cit = await User.findOne({ name: /CIT/i });
        if (cit) {
            output += '\nCIT Detailed:\n';
            output += JSON.stringify(cit, null, 2);
        } else {
            output += '\nCIT not found\n';
        }
        fs.writeFileSync('cit_check_results.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('cit_check_results.txt', err.stack);
        process.exit(1);
    }
};

checkCit();
