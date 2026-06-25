
const axios = require('axios');

const testAPIs = async () => {
    const baseUrl = 'http://localhost:5000/api/public';
    try {
        console.log('Testing Public APIs...');
        
        const directorsRes = await axios.get(`${baseUrl}/directors`);
        console.log('Directors found:', directorsRes.data.length);
        const iitans = directorsRes.data.filter(d => d.display_target === 'IIT_LEADERSHIP');
        console.log('IITans found:', iitans.length);
        
        const storiesRes = await axios.get(`${baseUrl}/success-stories`);
        console.log('Success Stories found:', storiesRes.data.length);
        
        if (iitans.length > 0 && storiesRes.data.length > 0) {
            console.log('SUCCESS: Dynamic data is available publicly.');
        } else {
            console.log('WARNING: Some dynamic data is missing.');
        }
    } catch (error) {
        console.error('API Test Failed:', error.message);
        console.log('Make sure the server is running on port 5000.');
    }
};

testAPIs();
