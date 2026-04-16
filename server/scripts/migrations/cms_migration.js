
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration: About Us CMS & Team Targets...');

    // 1. Update directors table
    console.log('Updating directors table...');
    await client.query(`
      ALTER TABLE directors 
      ADD COLUMN IF NOT EXISTS display_target TEXT DEFAULT 'ABOUT_DIRECTOR';
    `);

    // 2. Separate Landing vs About directors based on current categories
    // Logic: If someone was a 'DIRECTOR' before, they are now 'ABOUT_DIRECTOR' by default.
    // We'll set a few to 'LANDING' if we can identify them (or just let the user do it later).

    // 3. Create cms_content table
    console.log('Creating cms_content table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_content (
        id UUID PRIMARY KEY,
        page_name TEXT NOT NULL,
        section_name TEXT NOT NULL,
        content_json JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(page_name, section_name)
      );
    `);

    // 4. Seed default About Us content
    console.log('Seeding default About Us content...');
    const aboutUsContent = [
      {
        section: 'hero',
        content: {
          title: 'Our Story',
          story: 'We are on a mission to revolutionize the educational landscape by bridging the gap between talent, institutions, and industry leaders through high-fidelity digital learning experiences.'
        }
      },
      {
        section: 'mission',
        content: {
          title: 'Our Mission',
          description: 'To democratize quality education and make advanced learning accessible to everyone, everywhere, regardless of their background.',
          icon: 'Rocket',
          color: '#5B5CFF'
        }
      },
      {
        section: 'vision',
        content: {
          title: 'Our Vision',
          description: 'Creating a global ecosystem where knowledge flows seamlessly between world-class institutions and ambitious learners.',
          icon: 'Globe',
          color: '#7A5CFF'
        }
      },
      {
        section: 'values',
        content: {
          title: 'Our Values',
          description: 'Innovation, accessibility, excellence, and continuous growth drive every decision we make at SkillDad.',
          icon: 'Award',
          color: '#B05CFF'
        }
      },
      {
        section: 'impact_hero',
        content: {
          title: 'High-Fidelity Educational Matrix',
          subtitle: 'Behind SkillDad is a team of educators, technologists, and industry experts dedicated to building the most advanced learning management system in the world. We don\'t just host courses; we engineer success paths.'
        }
      },
      {
        section: 'directors_header',
        content: {
          title: 'SKILLDAD Cordinates With',
          subtitle: 'Visionary leadership guiding the nexus of global institutional excellence.'
        }
      },
      {
        section: 'advisory_header',
        content: {
          title: 'Advisory Board',
          description: 'A global network of advisors and industry veterans providing strategic oversight.'
        }
      }
    ];

    const crypto = require('crypto');
    for (const item of aboutUsContent) {
      await client.query(`
        INSERT INTO cms_content (id, page_name, section_name, content_json)
        VALUES ($1, 'about_us', $2, $3)
        ON CONFLICT (page_name, section_name) DO UPDATE 
        SET content_json = EXCLUDED.content_json;
      `, [crypto.randomUUID(), item.section, JSON.stringify(item.content)]);
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
