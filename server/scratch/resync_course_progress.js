const dotenv = require('dotenv');
const path = require('path');
const { connectPostgres, query } = require('../config/postgres');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resyncAllProgress = async () => {
    try {
        await connectPostgres();
        console.log('Fetching enrollments for resync...');

        const enrollsRes = await query('SELECT student_id, course_id, completed_videos FROM enrollments');
        console.log(`Processing ${enrollsRes.rows.length} enrollments...`);

        for (const enroll of enrollsRes.rows) {
            const { student_id, course_id, completed_videos } = enroll;
            
            // Get total videos for this course
            const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [course_id]);
            if (!courseRes.rows[0]) continue;

            const modules = courseRes.rows[0].modules || [];
            const totalVideos = modules.reduce((acc, m) => acc + (m.videos?.length || 0), 0) || 1;
            
            const completedCount = Array.isArray(completed_videos) ? completed_videos.length : 0;
            const progress = Math.min(100, Math.round((completedCount / totalVideos) * 100));

            await query('UPDATE enrollments SET progress = $1 WHERE student_id = $2 AND course_id = $3', [progress, student_id, course_id]);
            console.log(`Updated Student ${student_id} for Course ${course_id}: ${progress}% (Videos: ${completedCount}/${totalVideos})`);
        }

        console.log('Progress resync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Resync failed:', error);
        process.exit(1);
    }
};

resyncAllProgress();
