const { exec } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');

const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const dbPath = path.join(__dirname, 'server', 'data', 'db');
const port = 27019;

console.log(`Starting mongod on port ${port} with dbpath ${dbPath}...`);

// Use a slightly different approach: just launch it and let it run
const mongod = exec(`"${mongodPath}" --dbpath="${dbPath}" --port ${port} --bind_ip 127.0.0.1`);

// Give it a few seconds to start
setTimeout(async () => {
    try {
        const uri = `mongodb://127.0.0.1:${port}/skilldad`;
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const usersCount = await db.collection('users').countDocuments();
        const coursesCount = await db.collection('courses').countDocuments();

        console.log(`FOUND ${usersCount} USERS in server/data/db!`);
        console.log(`FOUND ${coursesCount} COURSES in server/data/db!`);

        const users = await db.collection('users').find({}).limit(10).toArray();
        console.log('Sample users:');
        users.forEach(u => console.log(` - ${u.name} (${u.email})`));

        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}, 5000);
