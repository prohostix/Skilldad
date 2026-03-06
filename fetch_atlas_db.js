const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://rinsnac4_db_user:IWtudXhFbzDtPWsK@cluster0.xm5mhac.mongodb.net/skilldad?appName=Cluster0';

async function checkAtlas() {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(ATLAS_URI);
        console.log('Connected to Atlas!');

        const db = mongoose.connection.db;
        const usersCount = await db.collection('users').countDocuments();
        const coursesCount = await db.collection('courses').countDocuments();

        console.log(`Atlas Users Count: ${usersCount}`);
        console.log(`Atlas Courses Count: ${coursesCount}`);

        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count}`);
        }

    } catch (e) {
        console.error('Atlas Error:', e.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkAtlas();
