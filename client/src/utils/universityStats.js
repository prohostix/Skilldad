/**
 * Utility to calculate realistic, believable Scholar and Module numbers
 * for universities across landing pages and directory views.
 */
export const getBelievableUniversityStats = (u) => {
    if (!u) return { scholars: '2.4K+', modules: '24+' };

    // 1. Explicit admin overrides (from profile or database)
    const explicitScholars = u.total_scholars || u.profile?.total_scholars || u.profile?.totalScholars;
    const explicitModules = u.specialized_courses || u.profile?.specialized_courses || u.profile?.specializedCourses;

    // 2. Real counts if available
    const realStudentCount = Number(u.scholarCount || u.studentCount || 0);
    const assignedCoursesCount = Array.isArray(u.assigned_courses)
        ? u.assigned_courses.length
        : (typeof u.assigned_courses === 'string' ? (() => { try { return JSON.parse(u.assigned_courses).length; } catch { return 0; } })() : 0);
    const realCourseCount = Number(u.courseCount || assignedCoursesCount || 0);

    // 3. Deterministic hash based on university name for consistency across reloads
    const name = (u.name || '').trim();
    const nameLower = name.toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 10000;
    }

    // Curated mappings for prominent / partner institutions
    let defaultScholars = '2.4K+';
    let defaultModules = '24+';

    if (nameLower.includes('oxford')) {
        defaultScholars = '12K+';
        defaultModules = '45+';
    } else if (nameLower.includes('mit')) {
        defaultScholars = '18K+';
        defaultModules = '60+';
    } else if (nameLower.includes('stanford')) {
        defaultScholars = '15K+';
        defaultModules = '52+';
    } else if (nameLower.includes('zurich') || nameLower.includes('eth')) {
        defaultScholars = '10K+';
        defaultModules = '38+';
    } else if (nameLower.includes('manipal')) {
        defaultScholars = '4.5K+';
        defaultModules = '32+';
    } else if (nameLower.includes('jain')) {
        defaultScholars = '3.8K+';
        defaultModules = '28+';
    } else if (nameLower.includes('gla')) {
        defaultScholars = '2.6K+';
        defaultModules = '22+';
    } else if (nameLower.includes('mediterranean')) {
        defaultScholars = '1.8K+';
        defaultModules = '18+';
    } else if (nameLower.includes('iit')) {
        defaultScholars = '5.2K+';
        defaultModules = '42+';
    } else if (nameLower.includes('cambridge')) {
        defaultScholars = '14K+';
        defaultModules = '48+';
    } else if (nameLower.includes('harvard')) {
        defaultScholars = '16K+';
        defaultModules = '55+';
    } else {
        const scholarPool = ['1.8K+', '2.2K+', '2.5K+', '3.1K+', '3.6K+', '4.2K+', '2.8K+', '1.9K+', '3.4K+'];
        const modulePool = ['18+', '24+', '28+', '32+', '36+', '20+', '26+', '30+'];
        defaultScholars = scholarPool[hash % scholarPool.length];
        defaultModules = modulePool[(hash >> 2) % modulePool.length];
    }

    // Final Scholars calculation
    let scholars = defaultScholars;
    if (explicitScholars && String(explicitScholars).trim() && explicitScholars !== 'New' && explicitScholars !== '1+') {
        scholars = String(explicitScholars).includes('+') ? String(explicitScholars) : `${explicitScholars}+`;
    } else if (realStudentCount >= 100) {
        scholars = realStudentCount >= 1000
            ? `${(realStudentCount / 1000).toFixed(1)}K+`
            : `${realStudentCount.toLocaleString()}+`;
    }

    // Final Modules calculation
    let modules = defaultModules;
    if (explicitModules && String(explicitModules).trim() && explicitModules !== 'New') {
        modules = String(explicitModules).includes('+') ? String(explicitModules) : `${explicitModules}+`;
    } else if (realCourseCount >= 12) {
        modules = `${realCourseCount}+`;
    } else if (realCourseCount > 0) {
        // If the university has some assigned courses, ensure a realistic catalog representation
        modules = `${Math.max(realCourseCount * 6, parseInt(defaultModules, 10))}+`;
    }

    return { scholars, modules };
};
