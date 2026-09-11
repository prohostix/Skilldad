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
    const res = await pool.query("SELECT modules FROM courses WHERE id = 'course_1784876161290'");
    const sourceModules = res.rows[0].modules;
    
    const updateRes = await pool.query(
      "UPDATE courses SET modules = $1 WHERE (title ILIKE '%Hospital Administration%' OR title ILIKE '%Hospital Management%') AND id != 'course_1784876161290'",
      [JSON.stringify(sourceModules)]
    );
    
    console.log(`Updated ${updateRes.rowCount} courses.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCourses();
