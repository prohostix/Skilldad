const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { query, connectPostgres } = require('./config/postgres');

async function createPayoutsTable() {
    try {
        await connectPostgres();
        console.log("Creating payouts table...");
        await query(`
            CREATE TABLE IF NOT EXISTS payouts (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL,
                amount NUMERIC NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'pending',
                notes TEXT,
                screenshot_url TEXT,
                request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                payout_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                reviewed_by TEXT,
                reviewed_at TIMESTAMP WITH TIME ZONE
            )
        `);
        console.log("Payouts table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating payouts table:", err);
        process.exit(1);
    }
}

createPayoutsTable();
