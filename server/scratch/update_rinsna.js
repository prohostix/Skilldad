const { connectPostgres, query } = require('../config/postgres');
require('dotenv').config();

const updateRinsna = async () => {
    await connectPostgres();
    // 1. Find the student
    const findRes = await query("SELECT id, name, profile FROM users WHERE name ILIKE '%rinsna%'");
    if (findRes.rows.length === 0) {
        console.log("No student found with name 'rinsna'");
        process.exit(1);
    }

    const student = findRes.rows[0];
    console.log(`Found Student: ${student.name} (ID: ${student.id})`);

    // 2. Update profile
    let profile = student.profile || {};
    if (typeof profile === 'string') {
        try { profile = JSON.parse(profile); } catch(e) { profile = {}; }
    }
    
    profile.phone = '917012555767';

    // 3. Save back to DB
    await query("UPDATE users SET profile = $1 WHERE id = $2", [JSON.stringify(profile), student.id]);
    
    console.log(`Successfully updated phone number for ${student.name}`);
    process.exit(0);
};

updateRinsna();
