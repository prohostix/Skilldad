const axios = require('axios');
require('dotenv').config({ path: './.env' });

const testTemplate = async () => {
    const apiKey = process.env.GUPSHUP_API_KEY;
    const source = process.env.GUPSHUP_SOURCE;
    const destination = '917012555767';
    const templateId = process.env.GUPSHUP_TEMPLATE_LIVE || 'live_session_scheduled';
    const variables = ['Rinsna', 'Advanced Web Development', 'May 10th, 10:00 AM'];

    console.log(`Testing Template: ${templateId} to ${destination}`);

    const payload = new URLSearchParams();
    payload.append('source', source);
    payload.append('destination', destination);
    payload.append('template', JSON.stringify({
        id: templateId,
        params: variables
    }));
    payload.append('src.name', 'SkillDadChat');

    try {
        const response = await axios.post(
            'https://api.gupshup.io/wa/api/v1/template/msg',
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

testTemplate();
