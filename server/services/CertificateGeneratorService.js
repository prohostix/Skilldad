const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/postgres');

/**
 * Certificate Generator Service
 * Generates premium PDF certificates for course completion.
 */
class CertificateGeneratorService {
    constructor() {
        this.certificatesDir = path.join(__dirname, '../../uploads/certificates');
        if (!fs.existsSync(this.certificatesDir)) {
            fs.mkdirSync(this.certificatesDir, { recursive: true });
        }
    }

    /**
     * Generate unique certificate ID
     */
    generateCertificateId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SD-CERT-${timestamp}-${random}`;
    }

    /**
     * Generate Certificate PDF
     */
    async generateCertificate(enrollmentId) {
        try {
            const enrollmentRes = await query(`
                SELECT e.*, 
                       u.name as student_name, u.email as student_email,
                       c.title as course_title, c.instructor_name as instructor_name
                FROM enrollments e
                JOIN users u ON e.student_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE e.id = $1
            `, [enrollmentId]);
            const enrollment = enrollmentRes.rows[0];

            if (!enrollment) throw new Error('Enrollment not found');

            const certId = this.generateCertificateId();
            const filename = `CERT-${enrollmentId}.pdf`;
            const filepath = path.join(this.certificatesDir, filename);
            const publicUrl = `/uploads/certificates/${filename}`;

            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 0
            });

            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // --- DECORATIVE BORDERS ---
            doc.rect(20, 20, 802, 555)
                .lineWidth(10)
                .strokeColor('#7C3AED') // SkillDad Primary Purple
                .stroke();

            doc.rect(35, 35, 772, 525)
                .lineWidth(2)
                .strokeColor('#C026D3') // SkillDad Magenta
                .stroke();

            // --- LOGO & HEADER ---
            const logoPath = path.join(__dirname, '../../client/public/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 371, 60, { width: 100 });
            }

            doc.font('Helvetica-Bold')
                .fontSize(45)
                .fillColor('#1F2937')
                .text('CERTIFICATE', 0, 180, { align: 'center' });

            doc.fontSize(20)
                .text('OF COMPLETION', 0, 230, { align: 'center', characterSpacing: 5 });

            // --- STATEMENT ---
            doc.font('Helvetica')
                .fontSize(16)
                .fillColor('#4B5563')
                .text('This is to certify that', 0, 280, { align: 'center' });

            doc.font('Helvetica-Bold')
                .fontSize(32)
                .fillColor('#7C3AED')
                .text(enrollment.student_name.toUpperCase(), 0, 310, { align: 'center' });

            doc.font('Helvetica')
                .fontSize(16)
                .fillColor('#4B5563')
                .text('has successfully decoded and mastered the curriculum of', 0, 360, { align: 'center' });

            doc.font('Helvetica-Bold')
                .fontSize(24)
                .fillColor('#111827')
                .text(enrollment.course_title, 0, 390, { align: 'center' });

            // --- FOOTER DETAILS ---
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Date
            doc.font('Helvetica')
                .fontSize(12)
                .text(`Issued on: ${date}`, 100, 480);

            // Instructor
            doc.text(`Instructor: ${enrollment.instructor_name || 'SkillDad Academic Board'}`, 0, 480, { align: 'right', indent: 100 });

            // Certificate ID
            doc.fontSize(10)
                .fillColor('#9CA3AF')
                .text(`Verification ID: ${certId}`, 0, 530, { align: 'center' });

            // Seal-like element
            doc.circle(421, 480, 40)
                .lineWidth(2)
                .strokeColor('#7C3AED')
                .stroke();

            doc.fontSize(14)
                .fillColor('#7C3AED')
                .text('OFFICIAL', 371, 473, { width: 100, align: 'center' });

            doc.end();

            return new Promise((resolve, reject) => {
                stream.on('finish', async () => {
                    await query('UPDATE enrollments SET certificate_issued = true, certificate_url = $1, updated_at = NOW() WHERE id = $2', [publicUrl, enrollmentId]);
                    resolve({ filepath, publicUrl, certId });
                });
                stream.on('error', reject);
            });

        } catch (error) {
            console.error('Certificate Generation Error:', error);
            throw error;
        }
    }
}

module.exports = new CertificateGeneratorService();
