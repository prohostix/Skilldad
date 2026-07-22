const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const colors = require('colors');

// Handle EIO (Input/output error) which can happen when terminal is detached
process.stdout.on('error', (err) => {
    if (err.code === 'EIO') return;
    console.error('stdout error:', err);
});
process.stderr.on('error', (err) => {
    if (err.code === 'EIO') return;
    console.error('stderr error:', err);
});


// Load env vars from the correct path regardless of where it's run from
dotenv.config({ path: path.join(__dirname, '.env') });


const { connectPostgres } = require('./config/postgres');
const { errorHandler } = require('./middleware/errorMiddleware');
const jobScheduler = require('./jobs');
const http = require('http');
const socketService = require('./services/SocketService');

const fs = require('fs');


const app = express();

// Registry of upload paths
const uploads = {
  ROOT: path.join(__dirname, 'uploads'),
  DOCS: path.join(__dirname, 'uploads/documents'),
  PROJECTS: path.join(__dirname, 'uploads/projects')
};

// Ensure upload directories exist with better error reporting
console.log('[Storage] Starting directory verification...');
const uploadsSucceeded = [];
const uploadsFailed = [];

Object.entries(uploads).forEach(([key, dirPath]) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`[Storage] Created ${key}: ${dirPath}`.green);
    } else {
      // Test writability
      const testFile = path.join(dirPath, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`[Storage] Verified ${key} (Writable): ${dirPath}`.cyan);
    }
    uploadsSucceeded.push(dirPath);
  } catch (err) {
    console.error(`[Storage] CRITICAL FAILURE for ${key}: ${dirPath}`.red.bold, err.message);
    uploadsFailed.push({ path: dirPath, error: err.message });
  }
});


// Expose root path for routes to use consistently
global.BASE_UPLOAD_PATH = uploads.ROOT;
global.STORAGE_STATUS = { succeeded: uploadsSucceeded, failed: uploadsFailed };

// app correctly initialized at top for logging
app.use(compression());
app.use(cookieParser());
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Initialize Exam WebSocket Service
const examWebSocketService = require('./services/examWebSocketService');
examWebSocketService.init();

// Start timers for ongoing exams (after DB connection)
setTimeout(() => {
  examWebSocketService.startTimersForOngoingExams();
}, 2000); // Wait 2 seconds for DB connection to be ready


// Middleware
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/payment/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// CORS — allow Vercel frontend + localhost dev
const allowedOrigins = [
  'https://skill-dad-client.vercel.app',
  'https://skilldad.vercel.app',
  'http://skilldad.com',
  'https://skilldad.com',
  'http://www.skilldad.com',
  'https://www.skilldad.com',
  'http://13.127.134.120',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'X-CSRF-Token'],
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/db-status', require('./routes/dbStatusRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/courses', require('./routes/interactiveContentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/grading', require('./routes/manualGradingQueueRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/enrollment', require('./routes/enrollmentRoutes'));
app.use('/api/university', require('./routes/universityRoutes'));
app.use('/api/partner', require('./routes/partnerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/skilldad-universities', require('./routes/skillDadUniversityRoutes'));
app.use('/api/admin/migrations', require('./routes/migrationRoutes'));
app.use('/api/sessions', require('./routes/liveSessionRoutes'));
app.use('/api/sessions', require('./whiteboard/whiteboardRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api', require('./routes/questionRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/discount', require('./routes/discountRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/study-abroad', require('./routes/studyAbroadRoutes'));
app.use('/api/admin/study-abroad', require('./routes/adminStudyAbroadRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/career', require('./routes/careerRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));

app.use('/', require('./routes/seoRoutes'));


// Payment Routes
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin/payment', require('./routes/adminPaymentRoutes'));
app.use('/api/admin/reconciliation', require('./routes/reconciliationRoutes'));
app.use('/api/admin/monitoring', require('./routes/monitoringRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint with storage and DB status
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const { query } = require('./config/postgres');
    await query('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error.message);
  }

  res.status(200).json({
    status: 'ok-v4',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    storage: global.STORAGE_STATUS || 'UNKNOWN'
  });
});

// Debug routes endpoint (DANGEROUS - ONLY FOR FIXING 404s)
app.get('/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${middleware.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', '')}${path}`);
        }
      });
    }
  });
  const fs = require('fs');
  const path = require('path');
  const files = fs.readdirSync(__dirname);
  const routesDir = fs.existsSync(path.join(__dirname, 'routes')) ? fs.readdirSync(path.join(__dirname, 'routes')) : 'MISSING';

  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
    rootFiles: files,
    routesFiles: routesDir,
    routes
  });
});

app.use(errorHandler);

// Initialize scheduled jobs
try {
  jobScheduler.initializeJobs();
  console.log('Scheduled jobs initialized successfully');
} catch (error) {
  console.error('Failed to initialize scheduled jobs:', error);
}

const PORT = process.env.PORT || 3030;

// Start Server with Database Connection
const startServer = async () => {
  try {
    console.log('[Server] Initializing database connection...'.yellow);
    await connectPostgres();

    // Auto-migrate: ensure faqs table has all required columns
    try {
        const { query } = require('./config/postgres');
        const colRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['faqs']);
        const cols = colRes.rows.map(r => r.column_name);
        if (!cols.includes('help_link')) await query('ALTER TABLE faqs ADD COLUMN help_link TEXT');
        if (!cols.includes('demo_video_link')) await query('ALTER TABLE faqs ADD COLUMN demo_video_link TEXT');
        if (!cols.includes('views')) await query('ALTER TABLE faqs ADD COLUMN views INTEGER DEFAULT 0');
        if (!cols.includes('upvotes')) await query('ALTER TABLE faqs ADD COLUMN upvotes INTEGER DEFAULT 0');
        if (!cols.includes('downvotes')) await query('ALTER TABLE faqs ADD COLUMN downvotes INTEGER DEFAULT 0');
        if (!cols.includes('updated_at')) await query('ALTER TABLE faqs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()');
        await query(`CREATE TABLE IF NOT EXISTS faq_search_analytics (id SERIAL PRIMARY KEY, query TEXT UNIQUE NOT NULL, count INTEGER DEFAULT 1, updated_at TIMESTAMP DEFAULT NOW())`);

        // Seed default FAQs if table is empty
        const countRes = await query('SELECT COUNT(*) FROM faqs');
        if (parseInt(countRes.rows[0].count) === 0) {
            const crypto = require('crypto');
            const defaults = [
                { question: 'How to apply for job and internship', answer: 'Navigate to the Career & Placements portal. Browse the available vacancies in the "Jobs" or "Internships" tabs. Click on any listing to view details, then click "Apply" to submit your profile and resume. We suggest having a complete profile for a better chance of selection.', category: 'Career & Placements', help_link: '/dashboard/placements' },
                { question: 'How does the Refer & Earn program work?', answer: 'Share your unique referral code with friends. When they join SkillDad using your link, you earn 100 reward points instantly. These points are tracked in your Reward Wallet and can be redeemed for course discounts or exclusive certificates.', category: 'Rewards & Referrals', help_link: '/dashboard/reward-wallet' },
            ];
            for (const faq of defaults) {
                await query('INSERT INTO faqs (id, question, answer, category, help_link) VALUES ($1, $2, $3, $4, $5)', [crypto.randomUUID(), faq.question, faq.answer, faq.category, faq.help_link]);
            }
            console.log('[Migration] Seeded default FAQs'.green);
        }

        console.log('[Migration] FAQs table columns verified/updated'.green);
        
        // Auto-migrate: Batch Management
        console.log('[Migration] Verifying Batch Management schema...'.yellow);
        await query(`
            CREATE TABLE IF NOT EXISTS batches (
                id SERIAL PRIMARY KEY,
                course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        const tablesToUpdate = ['enrollments', 'live_sessions'];
        for (const table of tablesToUpdate) {
            const colCheck = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'batch_id'", [table]);
            if (colCheck.rows.length === 0) {
                await query(`ALTER TABLE ${table} ADD COLUMN batch_id INTEGER REFERENCES batches(id)`);
                console.log(`[Migration] Added batch_id to ${table}`.green);
            }
        }

        // Special handling for exams: batch_ids (array)
        const examColCheck = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'batch_ids'");
        if (examColCheck.rows.length === 0) {
            await query("ALTER TABLE exams ADD COLUMN batch_ids INTEGER[] DEFAULT NULL");
            console.log("[Migration] Added batch_ids (array) to exams".green);
        }

        // Ensure university_id exists in enrollments for cohort scoping
        const uniColCheck = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'university_id'");
        if (uniColCheck.rows.length === 0) {
            await query('ALTER TABLE enrollments ADD COLUMN university_id VARCHAR(255) REFERENCES users(id)');
            console.log('[Migration] Added university_id to enrollments'.green);
        }
        
        console.log('[Migration] Batch Management schema verified'.green);

        // Auto-migrate: ensure live_sessions table has partner_id
        const sessColRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['live_sessions']);
        const sessCols = sessColRes.rows.map(r => r.column_name);
        if (!sessCols.includes('partner_id')) {
            await query('ALTER TABLE live_sessions ADD COLUMN partner_id VARCHAR(255) REFERENCES users(id)');
            console.log('[Migration] Added partner_id to live_sessions'.green);
        }

        // Auto-migrate: Create sales_applications table
        await query(`
            CREATE TABLE IF NOT EXISTS sales_applications (
                id VARCHAR(255) PRIMARY KEY,
                sales_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
                university_name VARCHAR(255) NOT NULL,
                course_name VARCHAR(255) NOT NULL,
                university_logo VARCHAR(255),
                fee_amount NUMERIC NOT NULL,
                student_name VARCHAR(255),
                father_name VARCHAR(255),
                student_address TEXT,
                student_email VARCHAR(255),
                student_phone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                razorpay_order_id VARCHAR(255),
                razorpay_payment_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        console.log('[Migration] sales_applications table verified/created'.green);

        // Auto-migrate: ensure sales_applications has student_dob
        const salesColRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['sales_applications']);
        const salesCols = salesColRes.rows.map(r => r.column_name);
        if (!salesCols.includes('student_dob')) {
            await query('ALTER TABLE sales_applications ADD COLUMN student_dob VARCHAR(50)');
            console.log('[Migration] Added student_dob to sales_applications'.green);
        }

        // Auto-migrate: ensure skill_dad_universities has profile media columns
        const sdUniColRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['skill_dad_universities']);
        const sdUniCols = sdUniColRes.rows.map(r => r.column_name);
        if (!sdUniCols.includes('profile_image')) {
            await query('ALTER TABLE skill_dad_universities ADD COLUMN profile_image VARCHAR(255)');
            console.log('[Migration] Added profile_image to skill_dad_universities'.green);
        }
        if (!sdUniCols.includes('cover_image')) {
            await query('ALTER TABLE skill_dad_universities ADD COLUMN cover_image VARCHAR(255)');
            console.log('[Migration] Added cover_image to skill_dad_universities'.green);
        }
        if (!sdUniCols.includes('gallery')) {
            await query("ALTER TABLE skill_dad_universities ADD COLUMN gallery JSONB DEFAULT '[]'::jsonb");
            console.log('[Migration] Added gallery to skill_dad_universities'.green);
        }

        // Auto-migrate: ensure courses has program_type (Skill Courses vs Skill Integrated Degree Programmes)
        const courseColRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['courses']);
        const courseCols = courseColRes.rows.map(r => r.column_name);
        if (!courseCols.includes('program_type')) {
            await query("ALTER TABLE courses ADD COLUMN program_type VARCHAR(30) NOT NULL DEFAULT 'course'");
            console.log('[Migration] Added program_type to courses'.green);
        }
        if (!courseCols.includes('skill_dad_university_id')) {
            await query('ALTER TABLE courses ADD COLUMN skill_dad_university_id INTEGER REFERENCES skill_dad_universities(id) ON DELETE SET NULL');
            console.log('[Migration] Added skill_dad_university_id to courses'.green);
        }

        // Auto-migrate: ensure enquiries supports course-linked enrollment enquiries and status tracking
        const enquiryColRes = await query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", ['enquiries']);
        const enquiryCols = enquiryColRes.rows.map(r => r.column_name);
        if (!enquiryCols.includes('course_id')) {
            await query('ALTER TABLE enquiries ADD COLUMN course_id VARCHAR(255) REFERENCES courses(id) ON DELETE SET NULL');
            console.log('[Migration] Added course_id to enquiries'.green);
        }
        if (!enquiryCols.includes('course_name')) {
            await query('ALTER TABLE enquiries ADD COLUMN course_name VARCHAR(255)');
            console.log('[Migration] Added course_name to enquiries'.green);
        }
        if (!enquiryCols.includes('status')) {
            await query("ALTER TABLE enquiries ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'new'");
            console.log('[Migration] Added status to enquiries'.green);
        }
    } catch (migErr) {
        console.warn('[Migration] Database migration warning:', migErr.message);
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`.green.bold);
      
      const heapLimit = require('v8').getHeapStatistics().heap_size_limit;
      console.log(`[Server] Memory Heap Limit: ${(heapLimit / 1024 / 1024).toFixed(2)} MB`.cyan);

      // Self-ping every 14 minutes to prevent cold starts (primarily for Render, but kept for reliability)
      const pingUrl = `http://localhost:${PORT}/health`;
      console.log(`[KeepAlive] Starting self-ping every 14 min -> ${pingUrl}`);

      setInterval(() => {
        const http = require('http');
        http.get(pingUrl, (res) => {
          if (res.statusCode !== 200) {
            console.warn(`[KeepAlive] Ping received non-200 status: ${res.statusCode}`);
          }
        }).on('error', (err) => {
          console.warn('[KeepAlive] Ping failed:', err.message);
        });
      }, 14 * 60 * 1000); 
    });
  } catch (error) {
    console.error('[Server] Critical failure during startup:'.red.bold, error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  examWebSocketService.cleanup();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  examWebSocketService.cleanup();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
