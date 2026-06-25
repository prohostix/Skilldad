const axios = require('axios');

async function testSearch(q) {
    try {
        console.log(`Searching for: "${q}"`);
        const res = await axios.get(`http://localhost:3030/api/courses?search=${encodeURIComponent(q)}`);
        console.log(`Found ${res.data.length} results.`);
        res.data.forEach(c => console.log(`- ${c.title}`));
    } catch (e) {
        console.error(e.message);
    }
}

async function run() {
    await testSearch("ai audeo video creation");
    await testSearch("which one ai");
    await testSearch("ai audio");
}

run();
