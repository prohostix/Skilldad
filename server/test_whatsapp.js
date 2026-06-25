require('dotenv').config();
const whatsAppService = require('./services/WhatsAppService');

async function test() {
    const phone = '917012555767'; // Rinsna's number
    const name = 'Rinsna';
    
    console.log('--- Testing WhatsApp Templates ---');
    
    try {
        console.log('\n1. Testing common_status (Working for exams)');
        const res1 = await whatsAppService.sendTemplateMessage(phone, 'common_status', ['Test: Common Status', 'Status: OK']);
        console.log('Result:', JSON.stringify(res1, null, 2));
        
        console.log('\n2. Testing common_misc_2 (Used for Live Sessions)');
        const res2 = await whatsAppService.sendTemplateMessage(phone, 'common_misc_2', ['Test: Live Session at 10 AM', 'SkillDad']);
        console.log('Result:', JSON.stringify(res2, null, 2));
        
    } catch (error) {
        console.error('Test Failed:', error.message);
    } finally {
        process.exit();
    }
}

test();
