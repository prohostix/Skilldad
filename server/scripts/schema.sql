-- Reconstructed Schema for SkillDad PostgreSQL Migration

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    bio TEXT,
    profile_image TEXT,
    profile JSONB DEFAULT '{}'::jsonb,
    university_id TEXT,
    registered_by TEXT,
    partner_code TEXT,
    is_verified BOOLEAN DEFAULT false,
    discount_rate NUMERIC DEFAULT 0,
    reset_password_token TEXT,
    reset_password_expire TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category TEXT,
    price NUMERIC DEFAULT 0,
    instructor_id TEXT REFERENCES users(id),
    instructor_name TEXT,
    university_name TEXT,
    modules JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    progress NUMERIC DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    completed_videos JSONB DEFAULT '[]'::jsonb,
    completed_exercises JSONB DEFAULT '[]'::jsonb,
    grade TEXT,
    final_score NUMERIC,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 4. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id TEXT NOT NULL REFERENCES courses(id),
    university_id TEXT NOT NULL REFERENCES users(id),
    created_by_id TEXT NOT NULL REFERENCES users(id),
    exam_type TEXT NOT NULL,
    is_mock_exam BOOLEAN DEFAULT false,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    question_paper_url TEXT,
    allow_late_submission BOOLEAN DEFAULT false,
    late_submission_deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled',
    results_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    shuffle_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT false,
    passing_score NUMERIC DEFAULT 40,
    total_marks NUMERIC NOT NULL DEFAULT 0,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    question_type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_image TEXT,
    options JSONB,
    marks NUMERIC NOT NULL,
    negative_marks NUMERIC DEFAULT 0,
    "order" INTEGER NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Exam Submissions Table
CREATE TABLE IF NOT EXISTS exam_submissions_new (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'in-progress',
    answers JSONB DEFAULT '[]'::jsonb,
    total_marks NUMERIC DEFAULT 0,
    obtained_marks NUMERIC,
    percentage NUMERIC,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Results Table
CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    submission_id TEXT NOT NULL REFERENCES exam_submissions_new(id),
    total_marks NUMERIC NOT NULL,
    obtained_marks NUMERIC NOT NULL,
    percentage NUMERIC NOT NULL,
    grade TEXT,
    is_passed BOOLEAN,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Interactive Contents Table
CREATE TABLE IF NOT EXISTS interactive_contents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    time_limit INTEGER,
    attempts_allowed INTEGER DEFAULT -1,
    passing_score NUMERIC,
    show_solution_after TEXT DEFAULT 'submission',
    questions JSONB NOT NULL,
    course_id TEXT REFERENCES courses(id),
    module_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES users(id),
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
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT,
    provider_order_id TEXT,
    provider_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    github_url TEXT,
    status TEXT DEFAULT 'pending',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Live Sessions Table
CREATE TABLE IF NOT EXISTS live_sessions (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    instructor_id TEXT REFERENCES users(id),
    university_id TEXT REFERENCES users(id),
    course_id TEXT REFERENCES courses(id),
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL REFERENCES courses(id),
    module_id TEXT,
    content_id TEXT,
    content_type TEXT,
    answers JSONB,
    score NUMERIC,
    status TEXT DEFAULT 'submitted',
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    value NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'percentage' or 'fixed'
    partner_id TEXT REFERENCES users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
