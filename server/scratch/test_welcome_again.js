require('dotenv').config();
const { query, connectPostgres } = require('../config/postgres');
const notificationService = require('../services/NotificationService');


const testWelcome = async () => {
    try {
        await connectPostgres();
        const studentRes = await query("SELECT id as _id, name, email, profile FROM users WHERE name ILIKE '%rinsna%'");
        const student = studentRes.rows[0];
        student._id = student.id;

        console.log("Sending WELCOME message to verify connection...");
        
        await notificationService.send(
            student,
            'welcome',
            {},
            { email: false, whatsapp: true }
        );

        console.log("Welcome message sent to Gupshup.");
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
};

testWelcome();
