const { connectPostgres, query } = require('../../config/postgres');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
  try {
    console.log('🚀 Starting migration: Team University & Visibility Adjustments...');
    
    // Initialize DB connection
    await connectPostgres();

    // 1. Add university column
    console.log('Adding university column to directors...');
    await query(`
      ALTER TABLE directors 
      ADD COLUMN IF NOT EXISTS university VARCHAR(255);
    `);

    // 2. Adjust specific individuals to LANDING only
    console.log('Adjusting specific individuals to LANDING target ONLY...');
    const individuals = [
      'Prof. Dr. Anastas Angjeli',
      'Prof. Dr. Ramiz Zekaj',
      'Prof. Dr. Adrian Civici',
      'Prof. Dr. Ismail Kocayusufoglu'
    ];

    await query(`
      UPDATE directors 
      SET display_target = 'LANDING' 
      WHERE name = ANY($1)
    `, [individuals]);

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
