const { Pool } = require('pg'); 
const pool = new Pool({ 
  host: 'skilldad.cj0mo4q44gde.ap-south-1.rds.amazonaws.com', 
  user: 'postgres', 
  password: 'skilldad2026', 
  database: 'postgres', 
  port: 5432, 
  ssl: { rejectUnauthorized: false } 
}); 
pool.query("SELECT id, title, program_type, jsonb_array_length(modules) as num_modules, modules FROM courses WHERE title ILIKE '%Digital Marketing%'")
.then(res => { 
  console.log(JSON.stringify(res.rows.map(r => ({id: r.id, title: r.title, program_type: r.program_type, num: r.num_modules})), null, 2)); 
  if(res.rows.some(r => r.num_modules > 0)) { 
    const source = res.rows.find(r => r.num_modules > 0); 
    console.log('Source modules for ' + source.title + ' (' + source.id + '):'); 
    console.log(JSON.stringify(source.modules.map(m => m.title), null, 2)); 
  } 
  process.exit(0); 
})
.catch(e => { 
  console.error(e); 
  process.exit(1); 
});
