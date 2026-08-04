const { query } = require('../config/postgres');
const crypto = require('crypto');
const socketService = require('../services/SocketService');

// --- USER (Student) CONTROLLERS ---

/**
 * Get all open vacancies
 */
exports.getVacancies = async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM skilldad_vacancies WHERE status = 'open' ORDER BY created_at DESC"
        );
        res.json({ success: true, vacancies: result.rows });
    } catch (error) {
        console.error('getVacancies error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get a single vacancy by ID
 */
exports.getVacancyById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query("SELECT * FROM skilldad_vacancies WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Vacancy not found" });
        }
        res.json({ success: true, vacancy: result.rows[0] });
    } catch (error) {
        console.error('getVacancyById error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Apply to a vacancy
 */
exports.applyToVacancy = async (req, res) => {
    try {
        const { vacancy_id } = req.params;
        const student_id = req.user.id; // From authMiddleware (protect)
        const resume_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Check if already applied
        const existing = await query(
            "SELECT id FROM skilldad_applications WHERE vacancy_id = $1 AND student_id = $2",
            [vacancy_id, student_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: "You have already applied for this vacancy." });
        }

        const appResult = await query(
            "INSERT INTO skilldad_applications (vacancy_id, student_id, resume_url) VALUES ($1, $2, $3) RETURNING id",
            [vacancy_id, student_id, resume_url]
        );

        // Notify admins in real-time
        socketService.broadcast('vacancyApplicationUpdate', {
            id: appResult.rows[0].id,
            student_name: req.user.name,
            vacancy_id
        });

        res.json({ success: true, message: "Application submitted successfully." });
    } catch (error) {
        console.error('applyToVacancy error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get student's own applications
 */
exports.getMyApplications = async (req, res) => {
    try {
        const student_id = req.user.id;
        const result = await query(
            `SELECT a.*, v.title, v.company, v.location 
             FROM skilldad_applications a
             JOIN skilldad_vacancies v ON a.vacancy_id = v.id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [student_id]
        );
        res.json({ success: true, applications: result.rows });
    } catch (error) {
        console.error('getMyApplications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get placed students (Hall of Fame)
 */
exports.getPlacedStudents = async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM skilldad_placements ORDER BY order_index ASC, placed_date DESC"
        );
        res.json({ success: true, placements: result.rows });
    } catch (error) {
        console.error('getPlacedStudents error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ADMIN CONTROLLERS ---

/**
 * Get all vacancies for admin (includes closed)
 */
exports.adminGetVacancies = async (req, res) => {
    try {
        const result = await query("SELECT * FROM skilldad_vacancies ORDER BY created_at DESC");
        res.json({ success: true, vacancies: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create or update a vacancy
 */
exports.adminUpsertVacancy = async (req, res) => {
    try {
        const { id, title, company, description, requirements, about_company, location, job_type, salary_range, deadline, status } = req.body;

        if (id) {
            // Update
            await query(
                `UPDATE skilldad_vacancies 
                 SET title=$1, company=$2, description=$3, requirements=$4, about_company=$5, location=$6, job_type=$7, salary_range=$8, deadline=$9, status=$10, updated_at=CURRENT_TIMESTAMP
                 WHERE id=$11`,
                [title, company, description, requirements, about_company, location, job_type, salary_range, deadline, status, id]
            );
        } else {
            // Create
            await query(
                `INSERT INTO skilldad_vacancies (title, company, description, requirements, about_company, location, job_type, salary_range, deadline, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [title, company, description, requirements, about_company, location, job_type, salary_range, deadline, status || 'open']
            );
        }

        res.json({ success: true, message: `Vacancy ${id ? 'updated' : 'created'} successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a vacancy
 */
exports.adminDeleteVacancy = async (req, res) => {
    try {
        const { id } = req.params;
        await query("DELETE FROM skilldad_vacancies WHERE id = $1", [id]);
        res.json({ success: true, message: "Vacancy deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all applications for review
 */
exports.adminGetApplications = async (req, res) => {
    try {
        const result = await query(
            `SELECT a.*, v.title as vacancy_title, v.company as vacancy_company, s.name as student_name, s.email as student_email
             FROM skilldad_applications a
             JOIN skilldad_vacancies v ON a.vacancy_id = v.id
             JOIN users s ON a.student_id = s.id
             ORDER BY a.applied_at DESC`
        );
        res.json({ success: true, applications: result.rows });
    } catch (error) {
        console.error('adminGetApplications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update application status
 */
exports.adminUpdateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_remarks } = req.body;

        await query(
            "UPDATE skilldad_applications SET status = $1, admin_remarks = $2 WHERE id = $3",
            [status, admin_remarks, id]
        );

        res.json({ success: true, message: "Application status updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Manage Placements (Hall of Fame)
 */
exports.adminUpsertPlacement = async (req, res) => {
    try {
        const { id, student_name, company_name, designation, placed_date, order_index } = req.body;
        const student_photo = req.file ? `/uploads/${req.file.filename}` : req.body.student_photo;

        if (id) {
            await query(
                `UPDATE skilldad_placements 
                 SET student_name=$1, student_photo=$2, company_name=$3, designation=$4, placed_date=$5, order_index=$6
                 WHERE id=$7`,
                [student_name, student_photo, company_name, designation, placed_date, order_index, id]
            );
        } else {
            await query(
                `INSERT INTO skilldad_placements (student_name, student_photo, company_name, designation, placed_date, order_index)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [student_name, student_photo, company_name, designation, placed_date, order_index || 0]
            );
        }

        res.json({ success: true, message: "Placement entry saved." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminDeletePlacement = async (req, res) => {
    try {
        const { id } = req.params;
        await query("DELETE FROM skilldad_placements WHERE id = $1", [id]);
        res.json({ success: true, message: "Placement entry deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
