require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function migrate() {
    try {
        await connectPostgres();
        console.log("Starting migration for SkillDad universities part 2...");

        await query(`
            ALTER TABLE skill_dad_universities 
            ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS assigned_courses JSONB DEFAULT '[]'::jsonb;
        `);

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
