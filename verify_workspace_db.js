const { exec } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');

const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const dbPath = path.join(__dirname, '.mongodb_data');
const port = 27018;

console.log(`Starting mongod on port ${port} with dbpath ${dbPath}...`);

const mongod = exec(`"${mongodPath}" --dbpath="${dbPath}" --port ${port} --bind_ip 127.0.0.1`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

// Give it a few seconds to start
setTimeout(async () => {
    try {
        const uri = `mongodb://127.0.0.1:${port}/skilldad`;
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected!');
        const User = require('./server/models/userModel');
        const count = await User.countDocuments();
        console.log(`FOUND ${count} USERS in this data directory!`);

        const courses = await mongoose.connection.db.collection('courses').countDocuments();
        console.log(`FOUND ${courses} COURSES in this data directory!`);

        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}, 5000);
