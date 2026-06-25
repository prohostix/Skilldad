require('dotenv').config();
const { query, connectPostgres } = require('../config/postgres');
const notificationService = require('../services/NotificationService');


const forceNotify = async () => {
    try {
        await connectPostgres();
        
        // 1. Get the student Rinsna
        const studentRes = await query("SELECT id as _id, name, email, profile FROM users WHERE name ILIKE '%rinsna%'");
        if (studentRes.rows.length === 0) {
            console.log("Student Rinsna not found");
            process.exit(1);
        }
        const student = studentRes.rows[0];
        console.log(`Found Student: ${student.name} (Phone: ${student.profile?.phone})`);

        // 2. Mock session data
        const session = {
            topic: 'Deep Diagnostic Test',
            start_time: new Date(),
            description: 'Testing the notification pipeline'
        };

        console.log("Triggering NotificationService.send()...");
        
        const result = await notificationService.send(
            student,
            'liveSession',
            {
                topic: session.topic,
                startTime: session.start_time,
                description: session.description
            },
            { email: true, whatsapp: true }
        );

        console.log("Result:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        process.exit(1);
    }
};

forceNotify();
