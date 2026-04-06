'use strict';

require('dotenv').config({ path: '../../.env' });
const { connectPostgres, query } = require('../../config/postgres');

async function migrate() {
  console.log('Starting migration: create_whiteboard_snapshots');

  try {
    await connectPostgres();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS whiteboard_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
        format VARCHAR(10) NOT NULL CHECK (format IN ('png', 'json')),
        file_path VARCHAR(255) NOT NULL,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(createTableQuery);

    console.log('Migration successful: create_whiteboard_snapshots');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
