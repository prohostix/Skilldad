import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    ChevronRight,
    Trash2,
    ThumbsUp,
    ThumbsDown,
    Sparkles,
    GraduationCap,
    Landmark,
    Video,
    Award,
    Briefcase,
    HelpCircle,
    FileText,
    User,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoImg from '../../assets/logo.png';
import aiRobotImg from '../../assets/ai_robot.png';

// LMS rule-based responses
const LMS_RULES = [
    {
        match: (q) => q === 'hi' || q === 'hello' || q === 'hey' || q.includes('good morning') || q.includes('good afternoon'),
        response: "Hello! Welcome to SkillDad. How can I help you today?",
        noFollowUp: true
    },
    {
        match: (q) => q.includes('who are you') || q.includes('what is your name') || q.includes('your name'),
        response: "I am SkillDad AI! 🤖\n\nI'm the intelligent assistant built into the SkillDad LMS. I'm here to help you navigate your courses, assist with payment questions, troubleshoot technical issues, and guide you through your educational journey. How can I assist you right now?",
        noFollowUp: true
    },
    {
        match: (q) => q.includes('what do you do') || q.includes('what you do') || q.includes('about skilldad') || q.includes('what is skilldad'),
        response: "SkillDad is India's premier educational platform offering Placement Opportunities and European University Programs with EU Work Rights.\n\nWe provide:\n* Guaranteed Placements & Career Support\n* Advanced AI-powered learning via our custom LMS\n* Dual certifications from top global universities\n* A direct bridge to study and work abroad\n\nWould you like to explore our latest courses or university partners?",
        options: [
            { label: 'Browse Courses', link: '/courses' },
            { label: 'View Universities', link: '/platform' }
        ],
        noFollowUp: true
    },
    {
        match: (q) => q === 'thanks' || q === 'thank you' || q.includes('thank you') || q.includes('thanks') || q === 'thx',
        response: "You're very welcome! Let me know if you need anything else.",
        noFollowUp: true
    },
    {
        match: (q) => q === 'no' || q === 'nope' || q.includes('no thanks') || q.includes('no, thanks') || q === 'nothing' || q.includes('no need'),
        response: "Alright! You're very welcome. Feel free to reach out if you need anything else. Have a great day!",
        noFollowUp: true
    },
    {
        match: (q) => q === 'ok' || q === 'okay' || q === 'alright' || q === 'got it' || q === 'understood' || q === 'sure' || q === 'great',
        response: "Awesome! Let me know if you need anything else.",
        noFollowUp: true
    },
    {
        match: (q) => (q.includes('live') || q.includes('class')) && (q.includes('join') || q.includes('cant') || q.includes("can't") || q.includes('not') || q.includes('access')),
        response: "To join a live class:\n1. Check your internet connection.\n2. Go to Dashboard > Live Classes.\n3. Click the session at the correct time.\n\nIf it still does not work, please contact support.",
        options: [{ label: 'Contact Support', link: '/support' }]
    },
    {
        match: (q) => q.includes('certificate') || q.includes('cert'),
        response: "To download your certificate:\nDashboard > My Courses > Completed Courses > Download Certificate.\n\nIf the option is missing, the course may not be marked complete yet."
    },
    {
        match: (q) => q.includes('enroll') || (q.includes('register') && q.includes('course')),
        response: "To enroll in a course:\n1. Go to Courses from the top menu.\n2. Open the course you want.\n3. Click Enroll.\n\nIf enrollment is restricted, please contact your administrator."
    },
    {
        match: (q) => q.includes('course') && (q.includes('access') || q.includes('open') || q.includes('find') || q.includes('see') || q.includes('view')),
        response: "To access your courses:\nDashboard > My Courses.\n\nIf a course is missing, check your enrollment status or contact support.",
        options: [{ label: 'Contact Support', link: '/support' }]
    },
    {
        match: (q) => q.includes('course') && (q.length < 15 || q.includes('list') || q.includes('all') || q.includes('browse') || q.includes('what')),
        response: "You can browse all our available courses on the catalog page.",
        options: [{ label: 'Browse Courses', link: '/courses' }]
    },
    {
        match: (q) => (q.includes('exam') || q.includes('quiz') || q.includes('test')) && (q.includes('cant') || q.includes("can't") || q.includes('cannot') || q.includes('not see') || q.includes('missing') || q.includes('button') || q.includes('issue') || q.includes('problem') || q.includes('unable')),
        response: "If you do not see the 'Start Exam' button, please check the scheduled exam time. Once it is the correct time, simply refresh the page and the button will appear."
    },
    {
        match: (q) => q.includes('exam') || q.includes('quiz') || q.includes('test'),
        response: "To attend an exam in SkillDad:\n1. Navigate to your Dashboard and click on 'Exams'.\n2. Here you will see all your available exam options.\n3. Find your exam and click the 'Start Exam' button."
    },
    {
        match: (q) => q.includes('password') || q.includes('login') || (q.includes('account') && (q.includes('cant') || q.includes("can't") || q.includes('issue') || q.includes('problem'))),
        response: "For account or login issues:\n1. Use the Forgot Password link on the login page.\n2. Check your registered email for a reset link.\n\nIf you cannot access your email, please contact support.",
        options: [{ label: 'Contact Support', link: '/support' }]
    },
    {
        match: (q) => q.includes('upload') || (q.includes('document') && (q.includes('how') || q.includes('submit') || q.includes('add'))),
        response: "To upload a document:\nDashboard > Documents > Upload.\n\nSupported formats: PDF, JPG, PNG. Check the file size limit shown on the page."
    },
    {
        match: (q) => q.includes('universit'),
        response: "SkillDad partners with top European and global universities. Browse all partner universities and their programs.",
        options: [{ label: 'View Universities', link: '/platform' }]
    },
    {
        match: (q) => q.includes('placement') || q.includes('job') || q.includes('internship') || q.includes('career') || q.includes('vacancy'),
        response: "To apply for a job or internship:\n1. Go to Dashboard > Placements & Career.\n2. Browse available vacancies.\n3. Click Apply on any listing.\n\nMake sure your profile and CV are updated first."
    },
    {
        match: (q) => q.includes('payment') || q.includes('pay') || q.includes('purchase') || q.includes('fee') || q.includes('checkout'),
        response: "Students can purchase courses through the checkout page using two methods:\n\n1. Manual / Bank Transfer\nMake payments using the provided bank details. (Raise a support ticket if details are missing).\nAfter payment:\n* Take a clear screenshot or proof of payment\n* Upload it through the payment confirmation section\n* Admin will verify and manually enroll you\n\n2. Online Payment\nMake secure payments via the integrated Razorpay gateway.\nSupported methods:\n* UPI\n* Debit/Credit Cards\n* Net Banking / Wallets\nOnce successfully paid, the course is automatically enrolled."
    },
];

const INITIAL_WELCOME_OPTIONS = [
    {
        title: 'Explore Courses',
        description: 'Find the right course for your career',
        icon: 'GraduationCap',
        color: 'blue',
        action: 'explore_courses',
        link: '/courses'
    },
    {
        title: 'University Information',
        description: 'Details, eligibility & admission process',
        icon: 'Landmark',
        color: 'violet',
        action: 'university_info',
        link: '/platform'
    },
    {
        title: 'Live Classes',
        description: 'Join or check your live sessions',
        icon: 'Video',
        color: 'sky',
        action: 'live_class'
    },
    {
        title: 'Exams & Certificates',
        description: 'Check progress & download certificates',
        icon: 'Award',
        color: 'indigo',
        action: 'exams_certs'
    },
    {
        title: 'Job Alerts',
        description: 'Get latest job updates & opportunities',
        icon: 'Briefcase',
        color: 'pink',
        action: 'job_alerts',
        link: '/jobs'
    },
    {
        title: 'Other Queries',
        description: 'Login, profile and account assistance',
        icon: 'HelpCircle',
        color: 'amber',
        action: 'account_help'
    }
];

const renderOptionIcon = (iconName, color = 'indigo') => {
    const colorStyles = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        violet: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
        sky: { bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
        slate: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
    }[color] || { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' };

    let Icon = Sparkles;
    if (iconName === 'GraduationCap') Icon = GraduationCap;
    else if (iconName === 'Landmark') Icon = Landmark;
    else if (iconName === 'Video') Icon = Video;
    else if (iconName === 'Award') Icon = Award;
    else if (iconName === 'Briefcase') Icon = Briefcase;
    else if (iconName === 'HelpCircle') Icon = HelpCircle;
    else if (iconName === 'FileText') Icon = FileText;
    else if (iconName === 'User') Icon = User;

    return (
        <div className={`w-8 h-8 rounded-full ${colorStyles.bg} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
            <Icon size={15} className={colorStyles.text} />
        </div>
    );
};

const FloatingHelpWidget = () => {
    const location = useLocation();

    // Do not render chat widget in exam window, course player, or live session
    if (location.pathname.includes('/course/') || location.pathname.includes('/exam/') || location.pathname.includes('/session/')) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState({});
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const resetChat = () => {
        setMessages([
            {
                id: 'welcome_1',
                isBot: true,
                type: 'welcome_cards',
                text: "Hello! 👋\nI'm your SkillDad AI assistant.\nHow can I help you today?",
                options: INITIAL_WELCOME_OPTIONS
            }
        ]);
        setFeedbackSent({});
        setShowMenu(false);
    };

    // Close menu when clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize messages on open if empty
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            resetChat();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const handleOpenGuide = () => {
            setIsOpen(true);
            handleOptionAction('live_class');
        };
        window.addEventListener('open-career-guide', handleOpenGuide);
        return () => window.removeEventListener('open-career-guide', handleOpenGuide);
    }, []);

    const botReply = (text) => ({
        id: (Date.now() + 1).toString(),
        isBot: true,
        type: 'text',
        text,
    });

    const followUp = () => ({
        id: 'followup_' + Date.now().toString(),
        isBot: true,
        type: 'text',
        text: 'Is there anything else I can help you with?',
    });

    const handleFeedback = async (messageId, faqId, isHelpful) => {
        if (feedbackSent[messageId]) return;

        try {
            await axios.post(`/api/faqs/${faqId}/feedback`, { isHelpful });
            setFeedbackSent(prev => ({ ...prev, [messageId]: isHelpful ? 'up' : 'down' }));
        } catch (err) {
            console.error('Feedback failed:', err);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const raw = inputValue.trim();
        const query = raw.toLowerCase();
        if (!query) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), isBot: false, text: raw }]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(async () => {
            // 1. Check rule-based LMS responses first
            const rule = LMS_RULES.find(r => r.match(query));
            if (rule) {
                if (rule.options) {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        isBot: true,
                        type: 'options',
                        text: rule.response,
                        options: rule.options,
                    }, ...(rule.noFollowUp ? [] : [followUp()])]);
                } else {
                    setMessages(prev => [...prev, botReply(rule.response), ...(rule.noFollowUp ? [] : [followUp()])]);
                }
                setIsTyping(false);
                return;
            }

            // 2. Search FAQs from DB
            try {
                const faqRes = await axios.get(`/api/faqs?search=${encodeURIComponent(query)}`);
                const faqs = faqRes.data || [];
                if (faqs.length > 0) {
                    const best = faqs[0];
                    const extras = [];
                    if (best.help_link) extras.push({ label: 'View Guide', link: best.help_link });
                    if (best.demo_video_link) extras.push({ label: 'Watch Demo', link: best.demo_video_link });
                    if (faqs.length > 1) {
                        extras.push(...faqs.slice(1, 3).map(f => ({ label: f.question, text: f.answer })));
                    }
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        isBot: true,
                        type: extras.length > 0 ? 'options' : 'text',
                        text: best.answer,
                        faqId: best.id,
                        options: extras.length > 0 ? extras : undefined,
                    }, followUp()]);
                    setIsTyping(false);
                    return;
                }
            } catch (err) {
                console.error('FAQ search failed:', err);
            }

            // 3. Course search
            if (query.includes('course') || query.includes('learn') || query.includes('program')) {
                try {
                    const conversationalFillers = /\b(show|tell|me|about|particular|the|view|i|want|to|learn|find|search|looking|for|can|you|please|is|what|how|courses|course|programs|program)\b/gi;
                    const subjectQuery = query.replace(conversationalFillers, '').replace(/\s+/g, ' ').trim();
                    const res = await axios.get(`/api/courses?search=${encodeURIComponent(subjectQuery)}${!subjectQuery ? '&featured=true' : ''}`);
                    if (res.data.length > 0) {
                        const courseResults = res.data.slice(0, 3);
                        const isSpecific = subjectQuery && res.data.length === 1;
                        const headingText = isSpecific
                            ? `Yes, I found the "${courseResults[0].title}" course. Would you like to view its details?`
                            : subjectQuery
                                ? `I found ${res.data.length} courses related to "${subjectQuery}". Which one are you interested in?`
                                : "Check out these top-rated courses on SkillDad:";
                        setMessages(prev => [...prev, {
                            id: (Date.now() + 1).toString(),
                            isBot: true,
                            type: 'options',
                            text: headingText,
                            options: [
                                ...courseResults.map(c => ({ label: isSpecific ? 'View Course Details' : c.title, link: `/course/${c._id}` })),
                                { label: 'Explore More Courses', link: '/courses' }
                            ]
                        }, followUp()]);
                        setIsTyping(false);
                        return;
                    }
                } catch (err) {
                    console.error('Course search failed:', err);
                }
            }

            // 4. Fallback
            const isCourseRelated = query.includes('course') || query.includes('learn') || query.includes('program') || query.includes('detail');
            if (isCourseRelated) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isBot: true,
                    type: 'options',
                    text: "We offer a wide variety of premium courses across Artificial Intelligence, Digital Marketing, Software Engineering, Web Development, and Business Management.",
                    options: [
                        { label: 'Explore Courses', link: '/courses' },
                        { label: 'Visit Help Center', link: '/support' }
                    ]
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isBot: true,
                    type: 'options',
                    text: "I couldn't find a specific answer to that. You can browse our help center or raise a support ticket.",
                    options: [
                        { label: 'Visit Help Center', link: '/support' },
                        { label: 'Raise a Ticket', link: '/support#ticket-form' },
                    ]
                }]);
            }
            setIsTyping(false);
        }, 600);
    };

    const handleOptionAction = (action) => {
        const OPTION_MAP = {
            explore_courses: {
                label: 'Explore Courses',
                response: "SkillDad offers a wide range of industry-recognized courses across AI, Software Engineering, Management, and European University programs with EU work rights.\n\nYou can browse our catalog or filter by domain to find the right program for your goals.",
                options: [
                    { label: 'Browse Course Catalog', link: '/courses' },
                    { label: 'View European Programs', link: '/platform' }
                ]
            },
            university_info: {
                label: 'University Information',
                response: "SkillDad partners directly with reputed European and Indian universities to provide accredited degrees and executive diplomas with dual certification and overseas job opportunities.\n\nWould you like to explore partner campuses and eligibility criteria?",
                options: [
                    { label: 'Explore Universities', link: '/platform' },
                    { label: 'Check Study Abroad', link: '/study-abroad' }
                ]
            },
            course_access: {
                label: 'Course Access',
                response: "To access your courses:\nDashboard > My Courses.\n\nIf a course is missing, check that your enrollment was confirmed. If the issue continues, please contact support.",
                options: [{ label: 'Contact Support', link: '/support' }]
            },
            live_class: {
                label: 'Live Classes',
                response: "To join a live class:\n1. Ensure you are logged into your student dashboard.\n2. Navigate to Dashboard > Live Classes.\n3. Click 'Join Class' at the scheduled time.\n\nIf still not working, please contact support.",
                options: [{ label: 'Go to Live Classes', link: '/dashboard/live' }, { label: 'Contact Support', link: '/support' }]
            },
            exams_certs: {
                label: 'Exams & Certificates',
                response: "For Exams & Certifications:\n* Exams: Go to Dashboard > Exams to view scheduled assessments.\n* Certificates: Once you finish all modules in a course, go to Dashboard > My Courses > Completed to download your verified certificate.",
                options: [
                    { label: 'View My Exams', link: '/dashboard/exams' },
                    { label: 'Completed Courses', link: '/dashboard/my-courses' }
                ]
            },
            job_alerts: {
                label: 'Job Alerts & Placements',
                response: "SkillDad provides placement support and exclusive job openings:\n1. Go to Job Alerts / Placements in your dashboard.\n2. Browse openings tailored to your skills.\n3. Apply directly with your updated profile and CV.",
                options: [
                    { label: 'Browse Job Alerts', link: '/jobs' },
                    { label: 'Contact Career Team', link: '/support' }
                ]
            },
            account_help: {
                label: 'Account & Login Help',
                response: "For login or account issues:\n* Forgot Password: Click 'Forgot Password' on the login screen.\n* Check your registered email for the reset link.\n* Need help? Our support desk is ready to assist.",
                options: [{ label: 'Contact Support', link: '/support' }]
            },
        };

        const item = OPTION_MAP[action];
        if (item) {
            const userMsg = { id: Date.now().toString(), isBot: false, text: item.label };
            const botMsg = {
                id: (Date.now() + 1).toString(),
                isBot: true,
                type: item.options ? 'options' : 'text',
                text: item.response,
                options: item.options,
            };
            setMessages(prev => [...prev, userMsg, botMsg, followUp()]);
        }
    };

    return (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[370px] bg-white dark:bg-[#0D091F] border border-indigo-100/80 dark:border-purple-900/40 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.28),0_4px_16px_-4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-[530px] max-h-[82vh] z-[101]"
                    >
                        {/* Header Banner */}
                        <div className="relative bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] text-white pt-3.5 pb-4 px-4 shrink-0 shadow-md select-none overflow-hidden">
                            {/* Decorative Sparkles & Ambient Glow */}
                            <span className="absolute top-2 left-1/3 text-white/25 text-[10px] pointer-events-none">✦</span>
                            <span className="absolute bottom-3 left-1/4 text-white/20 text-xs pointer-events-none">✦</span>
                            <span className="absolute top-4 right-1/3 text-white/20 text-[9px] pointer-events-none">✦</span>

                            {/* Cute Waving AI Mascot Robot Peeking */}
                            <div className="absolute right-12 -top-1 w-20 h-20 pointer-events-none select-none z-10 flex items-center justify-center">
                                <img
                                    src={aiRobotImg}
                                    alt="SkillDad AI Mascot"
                                    className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)] transform translate-y-0.5"
                                />
                            </div>

                            {/* Top Row: Brand Info & Action Icons */}
                            <div className="flex items-center justify-between relative z-20">
                                <div className="flex items-center gap-2.5">
                                    {/* White circular logo badge */}
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-md shrink-0 border border-white/40">
                                        <img src={logoImg} alt="SkillDad" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-bold text-[13.5px] tracking-tight text-white leading-tight">SkillDad AI</h3>
                                            <Sparkles size={11} className="text-yellow-300 animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10.5px] text-white/90 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse"></span>
                                            <span>Online <span className="opacity-60">·</span> Always here for you</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls: Menu & Close */}
                                <div className="flex items-center gap-1 relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowMenu(prev => !prev)}
                                        title="Options"
                                        className="text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                                    >
                                        <MoreVertical size={15} />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        title="Close"
                                        className="text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                                    >
                                        <X size={15} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showMenu && (
                                        <div className="absolute top-9 right-0 w-36 bg-white dark:bg-[#1A1530] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl py-1 text-gray-700 dark:text-gray-200 text-xs z-30">
                                            <button
                                                onClick={resetChat}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 text-red-500"
                                            >
                                                <Trash2 size={13} />
                                                <span>Clear Chat</span>
                                            </button>
                                            <button
                                                onClick={() => { setShowMenu(false); navigate('/support'); }}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                            >
                                                <HelpCircle size={13} />
                                                <span>Help Center</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Header Wave Divider to Body */}
                            <svg
                                className="absolute -bottom-0.5 left-0 right-0 w-full h-3 fill-[#FAF9FF] dark:fill-[#0D091F] block pointer-events-none"
                                viewBox="0 0 360 12"
                                preserveAspectRatio="none"
                            >
                                <path d="M0,0 C120,12 240,0 360,8 L360,12 L0,12 Z"></path>
                            </svg>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 flex flex-col gap-3.5 text-gray-800 dark:text-white bg-[#FAF9FF] dark:bg-[#0D091F]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.isBot ? 'self-start' : 'self-end'}`}>
                                    <div className="flex gap-2 items-start">
                                        {msg.isBot && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                                <Sparkles size={11} className="text-white" />
                                            </div>
                                        )}
                                        <div className={`
                                            p-3 rounded-2xl text-[12.5px] leading-relaxed shadow-sm
                                            ${msg.isBot
                                                ? 'bg-white dark:bg-[#16102D] border border-gray-100 dark:border-white/5 rounded-tl-sm text-gray-800 dark:text-gray-100'
                                                : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-tr-sm text-white shadow-indigo-500/10'}
                                        `}>
                                            {/* Welcome Greeting Banner */}
                                            {msg.type === 'welcome_cards' ? (
                                                <div className="space-y-1">
                                                    <div className="font-bold text-gray-900 dark:text-white text-[13px] flex items-center gap-1.5">
                                                        <span>Hello!</span>
                                                        <span>👋</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 text-[12px] leading-relaxed">
                                                        I'm your SkillDad AI assistant.<br />How can I help you today?
                                                    </p>
                                                </div>
                                            ) : msg.isBot ? (
                                                <div className="space-y-1.5">
                                                    {msg.text.split('\n').map((line, idx) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return null;
                                                        const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
                                                        if (numberedMatch) return (
                                                            <div key={idx} className="flex gap-2 items-start">
                                                                <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[8.5px] font-bold flex items-center justify-center mt-0.5">{numberedMatch[1]}</span>
                                                                <span>{numberedMatch[2]}</span>
                                                            </div>
                                                        );
                                                        if (/^[*\-•]\s+/.test(trimmed)) return (
                                                            <div key={idx} className="flex gap-2 items-start">
                                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></span>
                                                                <span>{trimmed.replace(/^[*\-•]\s+/, '')}</span>
                                                            </div>
                                                        );
                                                        return <p key={idx}>{trimmed}</p>;
                                                    })}
                                                </div>
                                            ) : (
                                                <span>{msg.text}</span>
                                            )}

                                            {/* Quick Option Cards (Welcome or Follow-up) */}
                                            {msg.options && (
                                                <div className="mt-2.5 flex flex-col gap-2">
                                                    {msg.options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                if (opt.link) navigate(opt.link);
                                                                else if (opt.action) handleOptionAction(opt.action);
                                                                else if (opt.text) setMessages(prev => [...prev, { id: 'msg_' + Date.now().toString(), isBot: true, text: opt.text }]);
                                                            }}
                                                            className="w-full text-left bg-white dark:bg-[#1A1530] hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-purple-50/60 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-2xl p-2 px-2.5 flex items-center justify-between gap-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all duration-200 group cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {opt.icon
                                                                    ? renderOptionIcon(opt.icon, opt.color)
                                                                    : (
                                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                                                            <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400" />
                                                                        </div>
                                                                    )
                                                                }
                                                                <div className="min-w-0">
                                                                    <h4 className="text-[12px] font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                                        {opt.title || opt.label}
                                                                    </h4>
                                                                    {opt.description && (
                                                                        <p className="text-[10px] text-gray-500 dark:text-white/50 truncate">
                                                                            {opt.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={13} className="text-gray-300 dark:text-white/30 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Feedback for FAQ responses */}
                                            {msg.isBot && msg.faqId && (
                                                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                                    <span className="text-[9.5px] text-gray-400 dark:text-white/40 italic">Was this helpful?</span>
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => handleFeedback(msg.id, msg.faqId, true)}
                                                            className={`p-1 rounded-md transition-all ${feedbackSent[msg.id] === 'up' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40'}`}
                                                            disabled={feedbackSent[msg.id]}
                                                        >
                                                            <ThumbsUp size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFeedback(msg.id, msg.faqId, false)}
                                                            className={`p-1 rounded-md transition-all ${feedbackSent[msg.id] === 'down' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40'}`}
                                                            disabled={feedbackSent[msg.id]}
                                                        >
                                                            <ThumbsDown size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[8.5px] text-gray-400 dark:text-white/30 mt-0.5 ${msg.isBot ? 'ml-8' : 'mr-1 text-right'}`}>
                                        {msg.isBot ? 'SkillDad AI' : 'You'}
                                    </span>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex flex-col max-w-[85%] self-start">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0 opacity-70 shadow-sm">
                                            <Sparkles size={11} className="text-white" />
                                        </div>
                                        <div className="p-2.5 px-3 bg-white dark:bg-[#16102D] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[32px] shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-0.5" />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-2.5 pt-2 bg-white dark:bg-[#0D091F] border-t border-gray-100 dark:border-white/5 shrink-0">
                            <div className="relative flex items-center bg-[#F3F4F6] dark:bg-[#16102D] border border-gray-200/70 dark:border-white/10 rounded-full pl-3 pr-1 py-1 focus-within:bg-white dark:focus-within:bg-[#16102D] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
                                <Sparkles size={13} className="text-indigo-500 shrink-0 ml-0.5" />
                                <input
                                    type="text"
                                    placeholder="Type your question..."
                                    className="w-full bg-transparent text-[12px] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/40 outline-none px-2 py-0.5"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    <Send size={12} className="ml-0.5" />
                                </button>
                            </div>
                        </form>

                        {/* Footer Accent Curve & Powered By */}
                        <div className="relative py-1.5 px-3 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-t border-indigo-50 dark:border-white/5 flex items-center justify-center gap-1.5 text-[9.5px] text-gray-400 dark:text-white/40 font-medium shrink-0">
                            <Sparkles size={9} className="text-indigo-500" />
                            <span>Powered by SkillDad AI</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Launcher Button (FAB) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(99,102,241,0.45)] hover:shadow-[0_12px_35px_rgba(99,102,241,0.6)] transition-all duration-300 bg-gradient-to-tr from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] hover:scale-105 active:scale-95 text-white border border-white/20 z-50 overflow-visible"
                >
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-25 pointer-events-none"></div>

                    {/* Micro Sparkle Accents */}
                    <span className="absolute -top-1 -right-1 text-yellow-300 text-[10px] animate-pulse pointer-events-none">✦</span>
                    <span className="absolute -bottom-0.5 -left-1 text-white/70 text-[9px] pointer-events-none">✦</span>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-[#0D091F]/90 backdrop-blur-md border border-[#6366F1]/30 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-x-2 group-hover:translate-x-0 shadow-lg">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-yellow-400" />
                            <span>Ask SkillDad AI</span>
                        </div>
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0D091F]/90 border-t border-r border-[#6366F1]/30 rotate-45" />
                    </div>

                    {/* Center Icon */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center">
                        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                    </div>

                    {/* Glowing Online Indicator */}
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0D091F] shadow-sm"></div>
                </button>
            )}
        </div>
    );
};

export default FloatingHelpWidget;
