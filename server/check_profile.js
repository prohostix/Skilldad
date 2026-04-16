const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/dell/Desktop/skill/SkillDad/SkillDad/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query("SELECT profile FROM users WHERE id = 'user_1773913695471'");
    console.log("PROFILE RESULT:", JSON.stringify(res.rows[0].profile));
    console.log("TYPE:", typeof res.rows[0].profile);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
