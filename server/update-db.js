const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb+srv://dilshadbvoc_db_user:skill123@cluster0.1dxv9c4.mongodb.net/skilldad?appName=Cluster0');
        
        const ServiceSchema = new mongoose.Schema({}, { strict: false, collection: 'services' });
        const Service = mongoose.model('Service', ServiceSchema);
        
        const res = await Service.updateMany(
            { title: "Placement Guaranteed" },
            { $set: { title: "Placement Opportunities" } }
        );
        
        console.log("Updated on Atlas DB:", res.modifiedCount);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
