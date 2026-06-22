import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, ChevronRight, Trash2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoImg from '../../assets/logo.png';

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
        response: "SkillDad is India's premier educational platform offering Placement Guaranteed European University Programs with EU Work Rights.\n\nWe provide:\n* Guaranteed Placements & Career Support\n* Advanced AI-powered learning via our custom LMS\n* Dual certifications from top global universities\n* A direct bridge to study and work abroad\n\nWould you like to explore our latest courses or university partners?",
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
        match: (q) => q.includes('enroll') || q.includes('register') && q.includes('course'),
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

const FloatingHelpWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState({}); // To track which messages have received feedback
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const resetChat = () => {
        setMessages([
            {
                id: 'welcome_1',
                isBot: true,
                type: 'options',
                text: "Welcome to SkillDad! How can I help you today? Select a topic or type your question.",
                options: [
                    { label: 'Course Access', action: 'course_access' },
                    { label: 'Live Classes', action: 'live_class' },
                    { label: 'Exams & Certificates', action: 'exams_certs' },
                    { label: 'Account Help', action: 'account_help' },
                ]
            }
        ]);
        setFeedbackSent({});
    };

    // Initialize messages on open if empty
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            resetChat();

        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            // 1. Check rule-based LMS responses first (fast, no network)
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

            // 2. Search FAQs from DB — primary knowledge source
            try {
                const faqRes = await axios.get(`/api/faqs?search=${encodeURIComponent(query)}`);
                const faqs = faqRes.data || [];
                if (faqs.length > 0) {
                    const best = faqs[0];
                    // Show the best match answer directly, formatted
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
                        faqId: best.id, // Store ID for feedback
                        options: extras.length > 0 ? extras : undefined,
                    }, followUp()]);
                    setIsTyping(false);
                    return;
                }
            } catch (err) {
                console.error('FAQ search failed:', err);
            }

            // 3. Course search — only if query seems course-related
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

            // 4. Final fallback
            const isCourseRelated = query.includes('course') || query.includes('learn') || query.includes('program') || query.includes('detail');
            
            if (isCourseRelated) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isBot: true,
                    type: 'options',
                    text: "We offer a wide variety of premium courses across disciplines like Artificial Intelligence, Digital Marketing, Software Engineering, Web Development, and Business Management. I recommend exploring our full course catalog to find the perfect program for your career goals.",
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
        }, 700);
    };

    const handleOptionAction = (action) => {
        const OPTION_MAP = {
            course_access: {
                label: 'Course Access',
                response: "To access your courses:\nDashboard > My Courses.\n\nIf a course is missing, check that your enrollment was confirmed. If the issue continues, please contact support.",
                options: [{ label: 'Contact Support', link: '/support' }]
            },
            live_class: {
                label: 'Live Classes',
                response: "To join a live class:\n1. Check your internet connection.\n2. Go to Dashboard > Live Classes.\n3. Click the session at the correct scheduled time.\n\nIf still not working, please contact support.",
                options: [{ label: 'Contact Support', link: '/support' }]
            },
            exams_certs: {
                label: 'Exams & Certificates',
                response: "To attend an exam:\n1. Go to Dashboard > Exams to see available options.\n2. Click 'Start Exam'. If the button isn't visible, check the scheduled time and refresh the page!\n\nFor certificates: Dashboard > My Courses > Completed > Download Certificate.",
                options: [{ label: 'Contact Support', link: '/support' }]
            },
            account_help: {
                label: 'Account Help',
                response: "For login or account issues:\n1. Use Forgot Password on the login page.\n2. Check your email for a reset link.\n\nFor other account problems, please contact support.",
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
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-4 right-6 w-[350px] sm:w-[400px] bg-[#0B071A]/80 backdrop-blur-xl border border-[#7C3AED]/40 rounded-2xl shadow-2xl overflow-hidden shadow-[#7C3AED]/20 flex flex-col h-[550px] max-h-[85vh] z-[101]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#E879F9] px-4 py-3 text-white flex justify-between items-center shrink-0 shadow-lg z-10 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                                    <img src={logoImg} alt="SkillDad" className="w-6 h-6 object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-sm tracking-tight">SkillDad AI</h3>
                                        <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] text-white/80 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                        Available Now
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative z-10">
                                <button 
                                    onClick={resetChat} 
                                    title="Clear Chat"
                                    className="text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>

                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5 text-white bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent),linear-gradient(to_bottom,#0B071A,#160E3A)]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end'}`}>
                                    <div className="flex gap-2 items-end">
                                        {msg.isBot && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E879F9] flex items-center justify-center shrink-0 mb-1 shadow-sm">
                                                <Bot size={12} className="text-white" />
                                            </div>
                                        )}
                                        <div className={`
                                            p-3 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-lg

                                            ${msg.isBot
                                                ? 'bg-white/10 border border-white/5 rounded-bl-none text-white/95'
                                                : 'bg-gradient-to-r from-[#7C3AED] to-[#E879F9] rounded-br-none text-white shadow-[#7C3AED]/20'}
                                        `}>
                                            {msg.isBot ? (
                                                <div className="space-y-1.5">
                                                    {msg.text.split('\n').map((line, idx) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return null;
                                                        const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
                                                        if (numberedMatch) return (
                                                            <div key={idx} className="flex gap-2 items-start">
                                                                <span className="shrink-0 w-4 h-4 rounded-full bg-primary/30 text-primary text-[9px] font-black flex items-center justify-center mt-0.5">{numberedMatch[1]}</span>
                                                                <span>{numberedMatch[2]}</span>
                                                            </div>
                                                        );
                                                        if (/^[*\-•]\s+/.test(trimmed)) return (
                                                            <div key={idx} className="flex gap-2 items-start">
                                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#A78BFA] mt-1.5"></span>
                                                                <span>{trimmed.replace(/^[*\-•]\s+/, '')}</span>
                                                            </div>
                                                        );
                                                        if (trimmed.includes(' * ')) {
                                                            return (
                                                                <div key={idx} className="space-y-1">
                                                                    {trimmed.split(' * ').filter(Boolean).map((part, pi) => (
                                                                        <div key={pi} className="flex gap-2 items-start">
                                                                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#A78BFA] mt-1.5"></span>
                                                                            <span>{part}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return <p key={idx}>{trimmed}</p>;
                                                    })}
                                                </div>
                                            ) : (
                                                <span>{msg.text}</span>
                                            )}

                                            {/* Options Type */}
                                            {msg.type === 'options' && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {msg.options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                if (opt.link) navigate(opt.link);
                                                                if (opt.action) handleOptionAction(opt.action);
                                                                if (opt.text) setMessages(prev => [...prev, { id: 'msg_' + Date.now().toString(), isBot: true, text: opt.text }]);
                                                            }}
                                                            className="text-left w-full text-[12px] sm:text-[13px] py-2 px-3 bg-white/5 hover:bg-[#7C3AED]/20 border border-white/10 hover:border-[#7C3AED]/50 rounded-xl transition-all flex items-center justify-between group shadow-sm"

                                                        >
                                                            <span className="group-hover:text-white transition-colors">{opt.label}</span>
                                                            <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#A78BFA]" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Feedback for FAQ responses */}
                                            {msg.isBot && msg.faqId && (
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[10px] text-white/40 italic">Was this helpful?</span>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleFeedback(msg.id, msg.faqId, true)}
                                                            className={`p-1.5 rounded-lg transition-all ${feedbackSent[msg.id] === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80'}`}
                                                            disabled={feedbackSent[msg.id]}
                                                        >
                                                            <ThumbsUp size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleFeedback(msg.id, msg.faqId, false)}
                                                            className={`p-1.5 rounded-lg transition-all ${feedbackSent[msg.id] === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80'}`}
                                                            disabled={feedbackSent[msg.id]}
                                                        >
                                                            <ThumbsDown size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}


                                            {/* FAQ Results Type - simple flat display */}
                                            {msg.type === 'faq_results' && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {msg.faqs.map((faq) => (
                                                        <div key={faq._id} className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-1.5">
                                                            <p className="font-semibold text-[10px] text-[#A78BFA]">{faq.question}</p>
                                                            <p className="text-[10px] text-white/75 leading-relaxed">{faq.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* No Results Type */}
                                            {msg.type === 'no_results' && (
                                                <button
                                                    onClick={() => navigate('/support')}
                                                    className="mt-3 text-xs py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center w-full justify-between"
                                                >
                                                    <span className="text-[#E879F9]">Contact Support</span>
                                                    <ChevronRight size={14} className="text-[#A78BFA]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[9px] text-white/30 mt-1 ${msg.isBot ? 'ml-9' : 'mr-1 text-right'}`}>
                                        {msg.isBot ? 'SkillDad AI' : 'You'}
                                    </span>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex flex-col max-w-[85%] self-start">
                                    <div className="flex gap-1 items-end">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E879F9] flex items-center justify-center shrink-0 mb-1 shadow-sm opacity-50">
                                            <Bot size={12} className="text-white" />
                                        </div>
                                        <div className="p-3 px-4 bg-white/5 border border-white/5 rounded-2xl rounded-bl-none flex items-center gap-1.5 h-[38px]">
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/10 shrink-0">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Type your question..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[#A78BFA] focus:bg-white/10 text-white transition-all shadow-inner placeholder-white/30"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E879F9] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#7C3AED]/20"
                                >
                                    <Send size={16} className="ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(124,58,237,0.4)] transition-all duration-500 bg-gradient-to-tr from-[#7C3AED] via-[#9333EA] to-[#E879F9] hover:scale-110 active:scale-95 text-white border border-white/20 z-50 overflow-visible"
                >
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full bg-[#7C3AED] animate-ping opacity-20 pointer-events-none"></div>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-5 bg-[#0B071A]/90 backdrop-blur-md border border-[#7C3AED]/30 text-white text-xs px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-x-4 group-hover:translate-x-0 shadow-xl">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span>Ask SkillDad AI</span>
                        </div>
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0B071A]/90 border-t border-r border-[#7C3AED]/30 rotate-45" />
                    </div>
                    <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-3 border-[#0B071A] shadow-lg shadow-green-400/20"></div>
                </button>
            )}
        </div>
    );
};

export default FloatingHelpWidget;
