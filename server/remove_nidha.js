require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function removeUser() {
    try {
        await connectPostgres();
        
        const searchResult = await query("SELECT id, name, email FROM users WHERE name ILIKE '%nidha%' OR email ILIKE '%nidha%'");
        console.log('Search Results:', searchResult.rows);

        if (searchResult.rows.length === 0) {
            console.log('No user found with name "nidha"');
            return;
        }

        for (const user of searchResult.rows) {
            console.log(`Deleting user: ${user.name} (${user.email})`);
            
            const userId = user.id;

            // Delete from all potential tables that might reference user.id
            const tablesWithStudentId = ['enrollments', 'transactions', 'submissions', 'documents', 'reward_points', 'referrals', 'skilldad_applications', 'certificates'];
            const tablesWithUserId = ['progress', 'students', 'discussions', 'user_progress', 'payment_approvals'];

            for (const table of tablesWithStudentId) {
                try { 
                    const res = await query(`DELETE FROM ${table} WHERE student_id = $1`, [userId]); 
                    console.log(`Deleted from ${table}: ${res.rowCount} rows`);
                } catch(e) { /* console.log(`Table ${table} skip: ${e.message}`); */ }
            }

            for (const table of tablesWithUserId) {
                try { 
                    const res = await query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]); 
                    console.log(`Deleted from ${table}: ${res.rowCount} rows`);
                } catch(e) { /* console.log(`Table ${table} skip: ${e.message}`); */ }
            }
            
            // Special cases
            try { await query('DELETE FROM referral_codes WHERE student_id = $1', [userId]); } catch(e) {}

            // Finally delete from users
            await query('DELETE FROM users WHERE id = $1', [userId]);
            console.log(`User ${userId} deleted successfully.`);
        }
    } catch (error) {
        console.error('Error removing user:', error);
    } finally {
        process.exit();
    }
}

removeUser();
