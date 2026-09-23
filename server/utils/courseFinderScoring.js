// Weighted Course Finder match scoring. Every point awarded traces back to a
// real answer the student gave or a real, admin-configured course property -
// nothing here is fabricated or randomized.

const CATEGORY_ALIASES = {
    'goal': 'goal',
    'career interest': 'careerInterest',
    'dream job': 'dreamJob',
    'education': 'education',
    'experience': 'experience',
    'skills': 'skills',
    'learning preference': 'learningPreference',
    'time availability': 'timeAvailability',
    'course preference': 'coursePreference',
    'work preference': 'workPreference'
};

const norm = (s) => (s || '').toString().trim().toLowerCase();

const overlaps = (a = [], b = []) => {
    const setB = new Set(b.map(norm));
    return a.filter((x) => setB.has(norm(x)));
};

function bucketResponses(responses, mappingByAnswerId) {
    const buckets = {};
    for (const key of Object.values(CATEGORY_ALIASES)) buckets[key] = { labels: [], mappings: [] };

    for (const r of responses) {
        const catKey = CATEGORY_ALIASES[norm(r.category_snapshot)];
        if (!catKey) continue;
        const labels = Array.isArray(r.answer_labels_snapshot) ? r.answer_labels_snapshot : [];
        buckets[catKey].labels.push(...labels);
        if (r.custom_text) buckets[catKey].labels.push(r.custom_text);
        for (const aid of (r.answer_ids || [])) {
            const mapping = mappingByAnswerId[aid];
            if (mapping) buckets[catKey].mappings.push(mapping);
        }
    }
    return buckets;
}

function scoreCourses(responses, mappingByAnswerId, courses, { limit = 3 } = {}) {
    const buckets = bucketResponses(responses, mappingByAnswerId);

    const careerCategories = new Set(
        buckets.careerInterest.mappings.map((m) => m.careerCategory).filter(Boolean).map(norm)
    );
    const careerRoleCandidates = [
        ...buckets.goal.mappings.flatMap((m) => m.careerRoles || []),
        ...buckets.careerInterest.mappings.flatMap((m) => m.careerRoles || []),
        ...buckets.dreamJob.labels
    ].filter((label) => Boolean(label) && norm(label) !== "i'm not sure yet");
    const careerRolesNorm = new Set(careerRoleCandidates.map(norm));

    const studentSkills = [
        ...buckets.skills.labels,
        ...buckets.skills.mappings.flatMap((m) => m.skills || [])
    ].filter((s) => norm(s) !== 'none yet');

    const educationLabel = buckets.education.labels[0];
    const learningPrefs = buckets.learningPreference.labels;
    const coursePrefs = buckets.coursePreference.labels.map(norm);
    const workPref = norm(buckets.workPreference.labels[0]);
    const timeAvailability = norm(buckets.timeAvailability.labels[0]);
    const isLightTimeBudget = timeAvailability.includes('less than 3') || timeAvailability.startsWith('3');

    const scored = courses.map((course) => {
        let score = 0;
        const reasons = [];
        const courseCategory = norm(course.career_category);
        const courseRoles = (course.career_roles || []).map(norm);
        const courseSkills = course.skills_developed || [];
        const courseEducation = (course.recommended_education || []).map(norm);
        const courseModes = (course.learning_modes || []).map(norm);
        const hasPlacement = course.program_type === 'wbl_abroad' || course.program_type === 'wbl_domestic';

        let goalOrRoleMatched = false;
        if (courseCategory && careerCategories.has(courseCategory)) { score += 30; goalOrRoleMatched = true; }
        if (courseRoles.some((r) => careerRolesNorm.has(r))) { score += 20; goalOrRoleMatched = true; }
        if (goalOrRoleMatched) reasons.push('Matches your career goal');

        if (courseEducation.length === 0 || (educationLabel && courseEducation.includes(norm(educationLabel)))) {
            score += 15;
            if (educationLabel) reasons.push('Fits your education level');
        }

        const matchedSkills = overlaps(courseSkills, studentSkills);
        if (matchedSkills.length > 0) {
            score += Math.min(15, matchedSkills.length * 4);
            reasons.push('Builds relevant skills');
        }

        const matchedModes = overlaps(courseModes, learningPrefs);
        if (matchedModes.length > 0) {
            score += Math.min(10, matchedModes.length * 3);
            reasons.push('Supports your preferred learning style');
        }

        if (hasPlacement && coursePrefs.some((p) => p.includes('placement'))) score += 5;
        if (coursePrefs.some((p) => p.includes('certificate'))) score += 5;

        if (timeAvailability && typeof course.duration_weeks === 'number') {
            if (isLightTimeBudget ? course.duration_weeks <= 6 : true) score += 5;
        }

        if (workPref.includes('abroad')) {
            if (course.program_type === 'wbl_abroad') score += 10;
        } else if (workPref) {
            if (course.program_type !== 'wbl_abroad') score += 5;
        }

        reasons.push('Certificate available');
        if (hasPlacement) reasons.push('Placement support available');

        let matchedRoleLabel = null;
        for (const cr of (course.career_roles || [])) {
            if (careerRolesNorm.has(norm(cr))) { matchedRoleLabel = cr; break; }
        }
        const careerRole = matchedRoleLabel
            || careerRoleCandidates[0]
            || (course.career_roles && course.career_roles[0])
            || course.title;

        return {
            courseId: course.id,
            careerRole,
            score: Math.max(0, Math.min(100, Math.round(score))),
            reasons: [...new Set(reasons)],
            hasPlacementSupport: hasPlacement
        };
    });

    return {
        recommendations: scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit),
        interestAreas: [...new Set(buckets.careerInterest.labels)]
    };
}

module.exports = { scoreCourses };
