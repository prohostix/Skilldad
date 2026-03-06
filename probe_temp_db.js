const mongoose = require('mongoose');
const port = 27018;

const test = async () => {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:${port}/admin`);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases on 27018:', dbs.databases.map(d => ({ name: d.name, size: d.sizeOnDisk })));

        for (const dbInfo of dbs.databases) {
            if (['admin', 'config', 'local'].includes(dbInfo.name)) continue;
            const conn = await mongoose.createConnection(`mongodb://127.0.0.1:${port}/${dbInfo.name}`).asPromise();
            const collections = await conn.db.listCollections().toArray();
            console.log(`Database: ${dbInfo.name}`);
            for (const col of collections) {
                const count = await conn.db.collection(col.name).countDocuments();
                console.log(`  - ${col.name}: ${count}`);
            }
            await conn.close();
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

test();
