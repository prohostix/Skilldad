const axios = require('axios');
require('dotenv').config({ path: './.env' });

const testWhatsApp = async () => {
    const apiKey = process.env.GUPSHUP_API_KEY;
    const source = process.env.GUPSHUP_SOURCE;
    const destination = '917012555767'; // User's number with country code

    console.log(`Testing with Source: ${source} and API Key: ${apiKey.substring(0, 5)}...`);

    const payload = new URLSearchParams();
    payload.append('source', source);
    payload.append('destination', destination);
    payload.append('message', JSON.stringify({
        type: 'text',
        text: 'Hello from SkillDad! Your WhatsApp integration is successfully connected.'
    }));
    payload.append('channel', 'whatsapp');
    payload.append('src.name', 'SkillDadChat');


    try {
        const response = await axios.post(
            'https://api.gupshup.io/wa/api/v1/msg',
            payload,
            {
                headers: {
                    'apikey': apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Details:', error.response ? error.response.data : error.message);
    }
};

testWhatsApp();
