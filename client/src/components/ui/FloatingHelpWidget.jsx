import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, PlayCircle, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FloatingHelpWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Initialize messages on open if empty
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome_1',
                    isBot: true,
                    type: 'text',
                    text: "Hi there! 👋 I'm your SkillDad AI Assistant."
                },
                {
                    id: 'welcome_2',
                    isBot: true,
                    type: 'options',
                    text: "How can I help you today? You can type a question, or pick an option below:",
                    options: [
                        { label: 'Create Account', link: '/register' },
                        { label: 'View Course Catalog', link: '/courses' },
                        { label: 'Explore Universities', link: '/universities' },
                        { label: 'Contact Support', link: '/support' }
                    ]
                }
            ]);
        }
    }, [isOpen]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();

        const query = inputValue.trim();
        if (!query) return;

        // Add user message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            isBot: false,
            text: query
        }]);

        setInputValue('');
        setIsTyping(true);

        try {
            const res = await axios.get(`/api/faqs?search=${encodeURIComponent(query)}`);
            const faqs = res.data.slice(0, 3); // top 3 results

            if (faqs.length > 0) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isBot: true,
                    type: 'faq_results',
                    text: "Here is what I found for you:",
                    faqs: faqs
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isBot: true,
                    type: 'no_results',
                    text: "I couldn't find an exact answer to your question. You can try rephrasing it, or reach out to our human support team."
                }]);
            }
        } catch (error) {
            console.error('Failed to fetch faqs', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                isBot: true,
                type: 'text',
                text: "Oops! I ran into a network error. Please try again later."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleHelpful = async (faqId, isHelpful) => {
        try {
            await axios.post(`/api/faqs/${faqId}/feedback`, { isHelpful });
            // Add a small confirmation message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                isBot: true,
                type: 'text',
                text: isHelpful ? "Glad I could help! 😊" : "Thanks for the feedback! We'll try to improve."
            }]);
        } catch (error) {
            console.error("Feedback failed");
        }
    };

    const toggleFaqExpanded = (msgId, faqId) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === msgId && msg.type === 'faq_results') {
                return {
                    ...msg,
                    expandedFaqId: msg.expandedFaqId === faqId ? null : faqId
                };
            }
            return msg;
        }));

        // Handle view count
        try {
            axios.post(`/api/faqs/${faqId}/view`);
        } catch (error) { }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] bg-[#0B071A] border border-[#7C3AED]/30 rounded-2xl shadow-2xl overflow-hidden shadow-[#7C3AED]/10 flex flex-col h-[550px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#7C3AED] to-[#E879F9] p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">AI Assistant</h3>
                                    <p className="text-[10px] text-white/80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4 text-white bg-gradient-to-b from-[#0B071A] to-[#160E3A]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end'}`}>
                                    <div className="flex gap-2 items-end">
                                        {msg.isBot && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E879F9] flex items-center justify-center shrink-0 mb-1 shadow-sm">
                                                <Bot size={12} className="text-white" />
                                            </div>
                                        )}
                                        <div className={`
                                            p-3 rounded-2xl text-sm shadow-sm
                                            ${msg.isBot
                                                ? 'bg-white/10 border border-white/5 rounded-bl-none text-white/90'
                                                : 'bg-gradient-to-r from-[#7C3AED] to-[#E879F9] rounded-br-none text-white'}
                                        `}>
                                            {msg.text}

                                            {/* Options Type */}
                                            {msg.type === 'options' && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {msg.options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => navigate(opt.link)}
                                                            className="text-left w-full text-xs py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center justify-between group"
                                                        >
                                                            <span>{opt.label}</span>
                                                            <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* FAQ Results Type */}
                                            {msg.type === 'faq_results' && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {msg.faqs.map((faq) => {
                                                        const isExpanded = msg.expandedFaqId === faq._id;
                                                        return (
                                                            <div key={faq._id} className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
                                                                <button
                                                                    onClick={() => toggleFaqExpanded(msg.id, faq._id)}
                                                                    className="w-full text-left p-3 flex justify-between items-start hover:bg-white/5"
                                                                >
                                                                    <span className="font-medium text-xs pr-2">{faq.question}</span>
                                                                    <ChevronRight size={14} className={`text-[#A78BFA] shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                                </button>

                                                                {isExpanded && (
                                                                    <div className="p-3 bg-white/5 border-t border-white/10 text-xs space-y-3">
                                                                        <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>

                                                                        {(faq.demo_video_link || faq.help_link) && (
                                                                            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                                                                {faq.demo_video_link && (
                                                                                    <a href={faq.demo_video_link} target="_blank" rel="noreferrer" className="flex items-center text-[#E879F9] hover:text-white transition-colors">
                                                                                        <PlayCircle size={14} className="mr-1.5" /> Watch Demo Video
                                                                                    </a>
                                                                                )}
                                                                                {faq.help_link && (
                                                                                    <a href={faq.help_link} target="_blank" rel="noreferrer" className="flex items-center text-[#7C3AED] hover:text-white transition-colors">
                                                                                        <BookOpen size={14} className="mr-1.5" /> Read Detailed Guide
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-2">
                                                                            <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">Helpful?</span>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleHelpful(faq._id, true)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-emerald-400 hover:text-emerald-300 transition-colors">Yes</button>
                                                                                <button onClick={() => handleHelpful(faq._id, false)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/50 hover:text-white transition-colors">No</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* No Results Type */}
                                            {msg.type === 'no_results' && (
                                                <button
                                                    onClick={() => navigate('/support')}
                                                    className="mt-3 text-xs py-2 px-3 bg-gradient-to-r from-[#7C3AED]/20 to-[#E879F9]/20 hover:from-[#7C3AED]/40 hover:to-[#E879F9]/40 border border-[#A78BFA]/30 rounded-lg transition-colors flex items-center w-full justify-between"
                                                >
                                                    <span className="font-medium text-[#E879F9]">Contact Human Support</span>
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
                                    className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#E879F9] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
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
                    className="group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 shadow-[#7C3AED]/30 bg-gradient-to-r from-[#7C3AED] to-[#E879F9] hover:scale-110 text-white border border-white/20 z-50 overflow-visible"
                >
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-black/80 backdrop-blur-md border border-[#7C3AED]/30 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-y-1 group-hover:translate-y-0">
                        Ask AI Assistant
                        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black/80 border-t border-r border-[#7C3AED]/30 rotate-45" />
                    </div>
                    <MessageCircle size={24} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0B071A]"></div>
                </button>
            )}
        </div>
    );
};

export default FloatingHelpWidget;
