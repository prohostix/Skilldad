require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function viewLogs() {
    try {
        await connectPostgres();
        const result = await query('SELECT id, type, recipient_name, recipient_phone, delivery_status, created_at FROM notification_logs ORDER BY created_at DESC LIMIT 5');
        console.log('Recent Notification Logs (Detailed):');
        result.rows.forEach(row => {
            console.log(`\nID: ${row.id} | Type: ${row.type} | Name: ${row.recipient_name} | Phone: ${row.recipient_phone}`);
            console.log('Status:', JSON.stringify(row.delivery_status, null, 2));
        });
    } catch (error) {
        console.error('Error viewing logs:', error);
    } finally {
        process.exit();
    }
}

viewLogs();
