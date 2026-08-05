const axios = require('axios');
require('dotenv').config();

const fetchTemplates = async () => {
    const baseUrl = `https://api.gupshup.io/sm/api/v1/template/list/SkillDad01`;
    const apiKey = process.env.GUPSHUP_API_KEY;

    try {
        const response = await axios.get(baseUrl, {
            headers: {
                'apikey': apiKey
            }
        });
        console.log("Templates:");
        response.data.templates.forEach(t => {
            if(t.elementName.includes('exam')) {
                console.log(JSON.stringify(t, null, 2));
            }
        });
    } catch (e) {
        console.log("Error fetching templates:", e.response ? e.response.data : e.message);
    }
}
fetchTemplates();
