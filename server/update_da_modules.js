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
    // Find the source Data Analytics course
    const res = await pool.query("SELECT id, modules, title, program_type FROM courses WHERE title ILIKE '%Data Analytics%' AND program_type = 'course' LIMIT 1");
    if (res.rows.length === 0) {
        console.log("Source Data Analytics course not found.");
        process.exit(1);
    }
    const sourceCourse = res.rows[0];
    const sourceModules = sourceCourse.modules;
    console.log(`Source course: ${sourceCourse.title} (${sourceCourse.id})`);
    
    if (!sourceModules) {
        console.log("Source course has no modules to copy.");
        process.exit(1);
    }
    
    // Find target courses
    const targetRes = await pool.query(
      "SELECT id, title, program_type FROM courses WHERE title ILIKE '%Data Analytics%' AND id != $1",
      [sourceCourse.id]
    );
    
    console.log(`Found ${targetRes.rows.length} courses to update:`);
    for (const course of targetRes.rows) {
      console.log(` - ${course.title} (${course.program_type})`);
    }

    // Now do the update
    const updateRes = await pool.query(
      "UPDATE courses SET modules = $1 WHERE title ILIKE '%Data Analytics%' AND id != $2",
      [JSON.stringify(sourceModules), sourceCourse.id]
    );
    
    console.log(`Updated ${updateRes.rowCount} courses.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateCourses();
