const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/userModel');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: { $in: ['partner', 'b2b', 'university', 'admin', 'finance'] } });
        let out = 'Relevant Users:\n';
        users.forEach(u => {
            out += `- ${u.name} (${u.role}) - ${u.email}\n`;
        });
        fs.writeFileSync('roles_list.txt', out);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('roles_list.txt', err.stack);
        process.exit(1);
    }
};

checkRoles();
