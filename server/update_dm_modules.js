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
    const res = await pool.query("SELECT modules FROM courses WHERE id = 'course_1785915014811'");
    const sourceModules = res.rows[0].modules;
    
    // Remove specific video IDs or keep them?
    // If we copy the modules, we might be copying the exact videos too (if they are just names/placeholders).
    // Let's strip the _id from the modules and videos so they get new IDs if they are edited later? 
    // Wait, Postgres JSONB doesn't strictly need unique _id unless the frontend requires it.
    // Let's generate new IDs for the copied modules to avoid React key collisions if they are ever merged, or just copy as-is.
    
    const targetRes = await pool.query(
      "SELECT id, title, program_type FROM courses WHERE title ILIKE '%Digital Marketing with AI%' AND id != 'course_1785915014811'"
    );
    
    console.log(`Found ${targetRes.rows.length} courses to update:`);
    for (const course of targetRes.rows) {
      console.log(` - ${course.title} (${course.program_type})`);
    }

    // Now do the update
    const updateRes = await pool.query(
      "UPDATE courses SET modules = $1 WHERE title ILIKE '%Digital Marketing with AI%' AND id != 'course_1785915014811'",
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
