const axios = require('axios');
require('dotenv').config();

const sendPlainText = async () => {
    const apiKey = process.env.GUPSHUP_API_KEY;
    const source = process.env.GUPSHUP_SOURCE;
    const destination = '917012555767';

    console.log(`Sending Plain Text to ${destination}...`);

    const payload = new URLSearchParams();
    payload.append('channel', 'whatsapp');
    payload.append('source', source);
    payload.append('destination', destination);
    payload.append('message', JSON.stringify({
        type: 'text',
        text: 'Hello from SkillDad! If you receive this, our connection is LIVE.'
    }));
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
        console.error('Error Details:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
};

sendPlainText();
