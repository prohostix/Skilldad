/**
 * Migration Controller
 * Handles one-time data migration tasks
 */

const { query } = require('../config/postgres');

/**
 * @desc    Fix admin enrollments by creating missing Progress records
 * @route   POST /api/admin/migrations/fix-enrollments
 * @access  Private (Admin only)
 */
const fixAdminEnrollments = async (req, res) => {
    try {
        console.log('[Migration] Starting admin enrollment fix...');

        // Find all active enrollments
        const enrollmentsRes = await query(`
            SELECT e.*, u.id as student_id, u.name as student_name, u.email as student_email, c.id as course_id, c.title as course_title
            FROM enrollments e
            LEFT JOIN users u ON e.student_id = u.id
            LEFT JOIN courses c ON e.course_id = c.id
            WHERE e.status = 'active'
        `);
        const enrollments = enrollmentsRes.rows;

        console.log(`[Migration] Found ${enrollments.length} active enrollments`);

        let fixedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const fixedEnrollments = [];

        // Process each enrollment
        for (const enrollment of enrollments) {
            try {
                if (!enrollment.student_id || !enrollment.course_id) {
                    console.log(`[Migration] Skipping enrollment ${enrollment.id} - missing student or course`);
                    skippedCount++;
                    continue;
                }

                // Check if Progress record exists
                const existingProgressRes = await query('SELECT id FROM progress WHERE user_id = $1 AND course_id = $2', [enrollment.student_id, enrollment.course_id]);

                if (existingProgressRes.rows.length > 0) {
                    // Progress record already exists, skip
                    skippedCount++;
                    continue;
                }

                // Create missing Progress record
                const newId = `prog_${Date.now()}`;
                await query(`
                    INSERT INTO progress (id, user_id, course_id, completed_videos, completed_exercises, project_submissions, is_completed)
                    VALUES ($1, $2, $3, '[]', '[]', '[]', false)
                `, [newId, enrollment.student_id, enrollment.course_id]);

                fixedCount++;
                fixedEnrollments.push({
                    studentName: enrollment.student_name,
                    studentEmail: enrollment.student_email,
                    courseTitle: enrollment.course_title
                });

                console.log(`[Migration] Fixed: ${enrollment.student_name} → ${enrollment.course_title}`);

            } catch (error) {
                errorCount++;
                console.error(`[Migration] Error processing enrollment ${enrollment.id}:`, error.message);
            }
        }

        // Return summary
        res.status(200).json({
            success: true,
            message: 'Admin enrollment fix completed',
            summary: {
                totalProcessed: enrollments.length,
                fixed: fixedCount,
                skipped: skippedCount,
                errors: errorCount
            },
            fixedEnrollments: fixedEnrollments
        });

    } catch (error) {
        console.error('[Migration] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
};

module.exports = {
    fixAdminEnrollments,
    fixFaqsTable
};

async function fixFaqsTable(req, res) {
    try {
        const colRes = await query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
            ['faqs']
        );
        const cols = colRes.rows.map(r => r.column_name);
        const added = [];

        if (!cols.includes('help_link')) {
            await query('ALTER TABLE faqs ADD COLUMN help_link TEXT');
            added.push('help_link');
        }
        if (!cols.includes('demo_video_link')) {
            await query('ALTER TABLE faqs ADD COLUMN demo_video_link TEXT');
            added.push('demo_video_link');
        }
        if (!cols.includes('views')) {
            await query('ALTER TABLE faqs ADD COLUMN views INTEGER DEFAULT 0');
            added.push('views');
        }
        if (!cols.includes('upvotes')) {
            await query('ALTER TABLE faqs ADD COLUMN upvotes INTEGER DEFAULT 0');
            added.push('upvotes');
        }
        if (!cols.includes('downvotes')) {
            await query('ALTER TABLE faqs ADD COLUMN downvotes INTEGER DEFAULT 0');
            added.push('downvotes');
        }
        if (!cols.includes('updated_at')) {
            await query('ALTER TABLE faqs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()');
            added.push('updated_at');
        }

        await query(`
            CREATE TABLE IF NOT EXISTS faq_search_analytics (
                id SERIAL PRIMARY KEY,
                query TEXT UNIQUE NOT NULL,
                count INTEGER DEFAULT 1,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        res.json({ success: true, existingColumns: cols, addedColumns: added });
    } catch (e) {
        console.error('[fixFaqsTable]', e.message);
        res.status(500).json({ message: e.message });
    }
}
