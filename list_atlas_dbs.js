const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://rinsnac4_db_user:IWtudXhFbzDtPWsK@cluster0.xm5mhac.mongodb.net/?appName=Cluster0';

async function listAtlasDbs() {
    try {
        await mongoose.connect(ATLAS_URI);
        const adminDb = mongoose.connection.db.admin();
        const dbs = await adminDb.listDatabases();

        console.log('--- ATLAS DATABASES ---');
        for (const db of dbs.databases) {
            console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
            if (db.sizeOnDisk > 0 && db.name !== 'admin' && db.name !== 'local') {
                const conn = await mongoose.createConnection(`mongodb+srv://rinsnac4_db_user:IWtudXhFbzDtPWsK@cluster0.xm5mhac.mongodb.net/${db.name}?appName=Cluster0`).asPromise();
                const collections = await conn.db.listCollections().toArray();
                for (const col of collections) {
                    const count = await conn.db.collection(col.name).countDocuments();
                    console.log(`    - ${col.name}: ${count}`);
                }
                await conn.close();
            }
        }

    } catch (e) {
        console.error('Atlas Error:', e.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

listAtlasDbs();
