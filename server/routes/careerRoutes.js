const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getVacancies,
    getVacancyById,
    applyToVacancy,
    getMyApplications,
    getPlacedStudents,
    adminGetVacancies,
    adminUpsertVacancy,
    adminDeleteVacancy,
    adminGetApplications,
    adminUpdateApplicationStatus,
    adminUpsertPlacement,
    adminDeletePlacement
} = require('../controllers/careerController');

// --- Student / Shared Routes ---
router.get('/vacancies', getVacancies);
router.get('/vacancies/:id', getVacancyById);
router.get('/placements', getPlacedStudents);
router.get('/my-applications', protect, getMyApplications);
router.post('/vacancies/:vacancy_id/apply', protect, upload.single('resume'), applyToVacancy);

// --- Admin Management Routes ---
router.get('/admin/vacancies', protect, admin, adminGetVacancies);
router.post('/admin/vacancies', protect, admin, adminUpsertVacancy);
router.delete('/admin/vacancies/:id', protect, admin, adminDeleteVacancy);

router.get('/admin/applications', protect, admin, adminGetApplications);
router.put('/admin/applications/:id/status', protect, admin, adminUpdateApplicationStatus);

router.post('/admin/placements', protect, admin, upload.single('student_photo'), adminUpsertPlacement);
router.delete('/admin/placements/:id', protect, admin, adminDeletePlacement);

module.exports = router;
