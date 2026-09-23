import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Search, Plus, X } from 'lucide-react';
import { getCourseFinderIcon } from '../../../utils/courseFinderIcons';

const authConfig = () => {
    const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return stored ? { headers: { Authorization: `Bearer ${stored.token}` } } : null;
};

const CourseFinderWizard = ({ attemptId, questions, initialResponses, initialIndex = 0, onComplete, onExit }) => {
    const [index, setIndex] = useState(Math.min(initialIndex, questions.length - 1));
    const [responses, setResponses] = useState(() => {
        const map = {};
        (initialResponses || []).forEach((r) => {
            map[r.questionId] = { answerIds: r.answerIds || [], customText: r.customText || '' };
        });
        return map;
    });
    const [search, setSearch] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const question = questions[index];
    const current = responses[question.id] || { answerIds: [], customText: '' };
    const isMulti = question.type === 'multi';
    const isLast = index === questions.length - 1;
    const progress = Math.round(((index + 1) / questions.length) * 100);

    const visibleAnswers = useMemo(() => {
        if (!question.config?.searchable || !search.trim()) return question.answers;
        const q = search.trim().toLowerCase();
        return question.answers.filter((a) => a.label.toLowerCase().includes(q));
    }, [question, search]);

    const hasAnswer = current.answerIds.length > 0 || !!current.customText;

    const toggleAnswer = (answerId) => {
        setError('');
        setResponses((prev) => {
            const existing = prev[question.id] || { answerIds: [], customText: '' };
            let answerIds;
            if (isMulti) {
                answerIds = existing.answerIds.includes(answerId)
                    ? existing.answerIds.filter((id) => id !== answerId)
                    : [...existing.answerIds, answerId];
            } else {
                answerIds = existing.answerIds.includes(answerId) ? [] : [answerId];
            }
            return { ...prev, [question.id]: { ...existing, answerIds } };
        });
    };

    const addCustom = () => {
        const text = customInput.trim();
        if (!text) return;
        setResponses((prev) => {
            const existing = prev[question.id] || { answerIds: [], customText: '' };
            return { ...prev, [question.id]: { ...existing, customText: text } };
        });
        setCustomInput('');
        setError('');
    };

    const persistCurrent = async () => {
        const payload = responses[question.id] || { answerIds: [], customText: '' };
        await axios.put(
            `/api/course-finder/attempts/${attemptId}/responses`,
            { questionId: question.id, answerIds: payload.answerIds, customText: payload.customText || null },
            authConfig()
        );
    };

    const handleNext = async () => {
        if (question.required && !hasAnswer) {
            setError('Please choose an option to continue.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await persistCurrent();
            if (isLast) {
                const { data } = await axios.post(`/api/course-finder/attempts/${attemptId}/complete`, {}, authConfig());
                onComplete(data);
            } else {
                setIndex((i) => i + 1);
                setSearch('');
            }
        } catch (err) {
            setError(err?.response?.data?.message || "We couldn't save that. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setError('');
        if (index === 0) {
            onExit?.();
        } else {
            setIndex((i) => i - 1);
            setSearch('');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] px-3 sm:px-4 py-3 sm:py-4 flex flex-col justify-center" style={{ background: '#FAF8FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="max-w-xl mx-auto w-full">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">SkillDad</span>
                    <span className="text-[11px] font-semibold text-slate-500">Question {index + 1} of {questions.length}</span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden mb-3">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#6D28D9' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white dark:bg-[#150d2a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-5"
                    >
                        <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#6D28D9' }}>
                            {question.category}
                        </div>
                        <h2 className="text-[15px] sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-1">
                            {question.question}
                        </h2>
                        {question.helperText && (
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{question.helperText}</p>
                        )}

                        {question.config?.searchable && (
                            <div className="relative mb-3">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search a job role..."
                                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9]"
                                />
                            </div>
                        )}

                        <div className={question.config?.searchable ? 'flex flex-wrap gap-1.5 mb-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3'}>
                            {visibleAnswers.map((answer) => {
                                const Icon = getCourseFinderIcon(answer.icon);
                                const selected = current.answerIds.includes(answer.id);
                                if (question.config?.searchable) {
                                    return (
                                        <button
                                            key={answer.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => toggleAnswer(answer.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                selected
                                                    ? 'text-white border-transparent'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#6D28D9]/40'
                                            }`}
                                            style={selected ? { background: '#4C1D95' } : undefined}
                                        >
                                            {selected && <Check className="w-3 h-3" />}
                                            {answer.label}
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={answer.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleAnswer(answer.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all active:scale-[0.99] ${
                                            selected ? 'border-[#6D28D9]' : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                                        }`}
                                        style={selected ? { background: '#F3E8FF' } : undefined}
                                    >
                                        <span
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: selected ? '#4C1D95' : '#F3E8FF', color: selected ? '#fff' : '#6D28D9' }}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 flex-1 leading-snug">{answer.label}</span>
                                        {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#4C1D95' }} />}
                                    </button>
                                );
                            })}
                        </div>

                        {question.config?.allowCustom && (
                            <div className="mb-1">
                                {current.customText ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3E8FF] text-[#4C1D95]">
                                        {current.customText}
                                        <button
                                            type="button"
                                            aria-label="Remove"
                                            onClick={() => setResponses((prev) => ({ ...prev, [question.id]: { ...prev[question.id], customText: '' } }))}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                                            placeholder="Add another..."
                                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCustom}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#4C1D95] border border-[#4C1D95]/30 hover:bg-[#F3E8FF]"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="text-xs text-rose-500 font-medium mt-1.5" role="alert">{error}</p>}
                    </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between mt-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
                        style={{ background: '#4C1D95' }}
                    >
                        {saving ? 'Saving...' : isLast ? 'See My Results' : 'Next'}
                        {!saving && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseFinderWizard;
