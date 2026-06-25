require('dotenv').config();
const whatsAppService = require('./services/WhatsAppService');

async function test() {
    const phone = '919072094608'; // Nidha's number
    
    console.log('--- Manual Test for Nidha ---');
    
    try {
        console.log('\nTesting common_status (Welcome style)');
        const res = await whatsAppService.sendTemplateMessage(phone, 'common_status', ['Welcome Nidha', 'Account Active']);
        console.log('Gupshup Response:', JSON.stringify(res, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        process.exit();
    }
}

test();
