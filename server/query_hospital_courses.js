const { Pool } = require('pg'); 
const pool = new Pool({ 
  host: 'skilldad.cj0mo4q44gde.ap-south-1.rds.amazonaws.com', 
  user: 'postgres', 
  password: 'skilldad2026', 
  database: 'postgres', 
  port: 5432, 
  ssl: { rejectUnauthorized: false } 
}); 

async function updateCourses() {
  try {
    const res = await pool.query("SELECT id, title, modules::text FROM courses WHERE modules::text ILIKE '%WhatsApp%'");
    console.log(`Found ${res.rows.length} courses matching WhatsApp:`);
    res.rows.forEach(r => {
      console.log(`- Course ID: ${r.id}, Title: "${r.title}"`);
    });

    const res2 = await pool.query("SELECT * FROM documents WHERE file_name ILIKE '%WhatsApp%' OR file_url ILIKE '%WhatsApp%'");
    console.log(`Found ${res2.rows.length} documents matching WhatsApp:`);
    res2.rows.forEach(r => {
      console.log(`- Doc ID: ${r.id}, Name: ${r.file_name}, Course: ${r.course_id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCourses();
