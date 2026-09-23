import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Copy, X, Save,
    Users, CheckCircle2, Clock, Award, Compass, PlayCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { COURSE_FINDER_ICON_NAMES, getCourseFinderIcon } from '../../utils/courseFinderIcons';
import CourseFinderWizard from '../student/CourseFinder/CourseFinderWizard';
import CourseFinderAnalyzing from '../student/CourseFinder/CourseFinderAnalyzing';
import CourseFinderResults from '../student/CourseFinder/CourseFinderResults';

const TABS = [
    { key: 'questions', label: 'Questions' },
    { key: 'roles', label: 'Career Roles & Skills' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'preview', label: 'Preview' }
];

const StatCard = ({ label, value, icon: Icon }) => (
    <GlassCard className="!p-4" noHover>
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                {Icon && <Icon size={16} />}
            </div>
            <div>
                <div className="text-xl font-extrabold text-white leading-none">{value}</div>
                <div className="text-xs text-white/50 mt-1">{label}</div>
            </div>
        </div>
    </GlassCard>
);

const RankedList = ({ title, items }) => (
    <GlassCard className="!p-5" noHover>
        <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
        {(!items || items.length === 0) ? (
            <p className="text-xs text-white/40">No data yet.</p>
        ) : (
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div key={it.label || it.title} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{i + 1}. {it.label || it.title}</span>
                        <span className="text-primary font-semibold">{it.count}</span>
                    </div>
                ))}
            </div>
        )}
    </GlassCard>
);

const AnswerRow = ({ answer, onSave, onDelete, onMove, isFirst, isLast, tagSuggestions }) => {
    const [local, setLocal] = useState(answer);
    const set = (field, value) => setLocal((prev) => ({ ...prev, [field]: value }));
    const setMapping = (field, value) => setLocal((prev) => ({ ...prev, mapping: { ...prev.mapping, [field]: value } }));

    const commit = (patch) => onSave({ ...local, ...patch });

    return (
        <div className={`p-3 rounded-xl border ${local.active === false ? 'border-white/5 opacity-50' : 'border-white/10'} bg-white/[0.02]`}>
            <div className="flex items-center flex-wrap gap-2 mb-2">
                <div className="flex flex-col shrink-0">
                    <button disabled={isFirst} onClick={() => onMove('up')} className="text-white/40 hover:text-white disabled:opacity-20"><ChevronUp size={14} /></button>
                    <button disabled={isLast} onClick={() => onMove('down')} className="text-white/40 hover:text-white disabled:opacity-20"><ChevronDown size={14} /></button>
                </div>
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    {React.createElement(getCourseFinderIcon(local.icon), { size: 14 })}
                </div>
                <input
                    value={local.label}
                    onChange={(e) => set('label', e.target.value)}
                    onBlur={() => commit({})}
                    className="flex-1 min-w-[140px] bg-transparent border-b border-white/10 focus:border-primary outline-none text-sm text-white py-1"
                    placeholder="Answer label"
                />
                <select
                    value={local.icon || ''}
                    onChange={(e) => { set('icon', e.target.value); commit({ icon: e.target.value }); }}
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white/70 px-2 py-1"
                >
                    <option value="">Icon</option>
                    {COURSE_FINDER_ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <button
                    onClick={() => { set('active', local.active === false); commit({ active: local.active === false }); }}
                    className="text-white/40 hover:text-white"
                    title={local.active === false ? 'Activate' : 'Deactivate'}
                >
                    {local.active === false ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => onDelete(local.id)} className="text-red-400/70 hover:text-red-400">
                    <Trash2 size={15} />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-9">
                <input
                    list={`cf-categories-${local.id}`}
                    value={local.mapping?.careerCategory || ''}
                    onChange={(e) => setMapping('careerCategory', e.target.value)}
                    onBlur={() => commit({})}
                    placeholder="Career category"
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 px-2 py-1.5"
                />
                <datalist id={`cf-categories-${local.id}`}>
                    {(tagSuggestions?.careerCategories || []).map((c) => <option key={c} value={c} />)}
                </datalist>
                <input
                    value={(local.mapping?.careerRoles || []).join(', ')}
                    onChange={(e) => setMapping('careerRoles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    onBlur={() => commit({})}
                    placeholder="Career roles (comma separated)"
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 px-2 py-1.5"
                />
                <input
                    value={(local.mapping?.skills || []).join(', ')}
                    onChange={(e) => setMapping('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    onBlur={() => commit({})}
                    placeholder="Skills (comma separated)"
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 px-2 py-1.5"
                />
            </div>
        </div>
    );
};

const QuestionCard = ({ question, onRefresh, tagSuggestions, config, showToast }) => {
    const [expanded, setExpanded] = useState(false);
    const [local, setLocal] = useState(question);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const saveQuestion = async (patch) => {
        try {
            await axios.put(`/api/admin/course-finder/questions/${question.id}`, patch, config);
            onRefresh();
        } catch {
            showToast('Failed to save question', 'error');
        }
    };

    const moveQuestion = async (direction) => {
        try {
            await axios.put(`/api/admin/course-finder/questions/${question.id}/move`, { direction }, config);
            onRefresh();
        } catch {
            showToast('Failed to reorder question', 'error');
        }
    };

    const duplicateQuestion = async () => {
        try {
            await axios.post(`/api/admin/course-finder/questions/${question.id}/duplicate`, {}, config);
            showToast('Question duplicated (inactive - review before enabling)', 'success');
            onRefresh();
        } catch {
            showToast('Failed to duplicate question', 'error');
        }
    };

    const deleteQuestion = async () => {
        try {
            const { data } = await axios.delete(`/api/admin/course-finder/questions/${question.id}`, config);
            showToast(data.softDeleted ? 'Question disabled (has real student responses)' : 'Question deleted', 'success');
            setConfirmDelete(false);
            onRefresh();
        } catch {
            showToast('Failed to delete question', 'error');
        }
    };

    const saveAnswer = async (answer) => {
        try {
            await axios.put(`/api/admin/course-finder/answers/${answer.id}`, {
                label: answer.label, icon: answer.icon, active: answer.active, mapping: answer.mapping
            }, config);
            onRefresh();
        } catch {
            showToast('Failed to save answer', 'error');
        }
    };

    const deleteAnswer = async (answerId) => {
        try {
            await axios.delete(`/api/admin/course-finder/answers/${answerId}`, config);
            onRefresh();
        } catch {
            showToast('Failed to delete answer', 'error');
        }
    };

    const moveAnswer = async (answerId, direction) => {
        try {
            await axios.put(`/api/admin/course-finder/answers/${answerId}/move`, { direction }, config);
            onRefresh();
        } catch {
            showToast('Failed to reorder answer', 'error');
        }
    };

    const addAnswer = async () => {
        try {
            await axios.post(`/api/admin/course-finder/questions/${question.id}/answers`, { label: 'New answer' }, config);
            onRefresh();
        } catch {
            showToast('Failed to add answer', 'error');
        }
    };

    return (
        <GlassCard className="!p-5" noHover>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary">{String(question.order).padStart(2, '0')}</span>
                        <input
                            value={local.question}
                            onChange={(e) => setLocal((p) => ({ ...p, question: e.target.value }))}
                            onBlur={() => saveQuestion({ question: local.question })}
                            className="flex-1 bg-transparent text-sm font-semibold text-white outline-none border-b border-transparent focus:border-primary/40"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mb-1">
                        <input
                            value={local.category}
                            onChange={(e) => setLocal((p) => ({ ...p, category: e.target.value }))}
                            onBlur={() => saveQuestion({ category: local.category })}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-40"
                        />
                        <select
                            value={local.type}
                            onChange={(e) => { setLocal((p) => ({ ...p, type: e.target.value })); saveQuestion({ type: e.target.value }); }}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1"
                        >
                            <option value="single">Single Select</option>
                            <option value="multi">Multi Select</option>
                        </select>
                        <label className="flex items-center gap-1.5">
                            <input
                                type="checkbox"
                                checked={local.required}
                                onChange={(e) => { setLocal((p) => ({ ...p, required: e.target.checked })); saveQuestion({ required: e.target.checked }); }}
                            />
                            Required
                        </label>
                        <span className={`px-2 py-0.5 rounded-full ${question.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                            {question.active ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                    <input
                        value={local.helperText || ''}
                        onChange={(e) => setLocal((p) => ({ ...p, helperText: e.target.value }))}
                        onBlur={() => saveQuestion({ helperText: local.helperText })}
                        placeholder="Helper text"
                        className="w-full bg-transparent text-xs text-white/40 italic outline-none border-b border-transparent focus:border-primary/40 mt-1"
                    />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col">
                        <button onClick={() => moveQuestion('up')} className="text-white/40 hover:text-white"><ChevronUp size={16} /></button>
                        <button onClick={() => moveQuestion('down')} className="text-white/40 hover:text-white"><ChevronDown size={16} /></button>
                    </div>
                    <button onClick={duplicateQuestion} className="p-1.5 text-white/50 hover:text-white" title="Duplicate"><Copy size={15} /></button>
                    <button
                        onClick={() => saveQuestion({ active: !question.active })}
                        className="p-1.5 text-white/50 hover:text-white"
                        title={question.active ? 'Disable' : 'Enable'}
                    >
                        {question.active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-red-400/70 hover:text-red-400" title="Delete"><Trash2 size={15} /></button>
                    <ModernButton variant="secondary" onClick={() => setExpanded((e) => !e)} className="!ml-1">
                        {expanded ? 'Hide Answers' : `Answers (${question.answers.length})`}
                    </ModernButton>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {question.answers.map((a, i) => (
                        <AnswerRow
                            key={a.id}
                            answer={a}
                            tagSuggestions={tagSuggestions}
                            isFirst={i === 0}
                            isLast={i === question.answers.length - 1}
                            onSave={saveAnswer}
                            onDelete={deleteAnswer}
                            onMove={(dir) => moveAnswer(a.id, dir)}
                        />
                    ))}
                    <button
                        onClick={addAnswer}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/15 text-xs font-semibold text-white/50 hover:text-white hover:border-primary/40"
                    >
                        <Plus size={14} /> Add Answer
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={confirmDelete}
                title="Delete this question?"
                message="If students have already answered it, it will be disabled instead of deleted, to keep their history intact."
                onConfirm={deleteQuestion}
                onCancel={() => setConfirmDelete(false)}
            />
        </GlassCard>
    );
};

const NewQuestionForm = ({ onCreated, config, showToast }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ question: '', category: '', type: 'single', required: true });

    const submit = async () => {
        if (!form.question.trim() || !form.category.trim()) {
            showToast('Question and category are required', 'error');
            return;
        }
        try {
            await axios.post('/api/admin/course-finder/questions', form, config);
            setForm({ question: '', category: '', type: 'single', required: true });
            setOpen(false);
            onCreated();
        } catch {
            showToast('Failed to create question', 'error');
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-dashed border-white/15 text-sm font-semibold text-white/60 hover:text-white hover:border-primary/40"
            >
                <Plus size={16} /> Add Question
            </button>
        );
    }

    return (
        <GlassCard className="!p-5" noHover>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                    value={form.question}
                    onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                    placeholder="Question text"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white sm:col-span-2"
                />
                <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Category (e.g. Goal)"
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="single">Single Select</option>
                    <option value="multi">Multi Select</option>
                </select>
            </div>
            <div className="flex items-center gap-3">
                <ModernButton onClick={submit}><Save size={14} /> Create</ModernButton>
                <ModernButton variant="ghost" onClick={() => setOpen(false)}><X size={14} /> Cancel</ModernButton>
            </div>
        </GlassCard>
    );
};

const CourseFinderManager = () => {
    const [activeTab, setActiveTab] = useState('questions');
    const [questions, setQuestions] = useState([]);
    const [tagSuggestions, setTagSuggestions] = useState({ careerRoles: [], skills: [], careerCategories: [] });
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${userInfo.token}` } }), [userInfo.token]);

    const fetchQuestions = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/admin/course-finder/questions', config);
            setQuestions(data);
        } catch {
            showToast('Failed to load questions', 'error');
        }
    }, [config]);

    const fetchTagSuggestions = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/admin/course-finder/tag-suggestions', config);
            setTagSuggestions(data);
        } catch { /* non-critical */ }
    }, [config]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/admin/course-finder/analytics', config);
            setAnalytics(data);
        } catch {
            showToast('Failed to load analytics', 'error');
        }
    }, [config]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchQuestions(), fetchTagSuggestions()]);
            setLoading(false);
        };
        load();
    }, [fetchQuestions, fetchTagSuggestions]);

    useEffect(() => {
        const load = async () => {
            if (activeTab === 'analytics') await fetchAnalytics();
        };
        load();
    }, [activeTab, fetchAnalytics]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <DashboardHeading title="Course Finder" />

            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            activeTab === tab.key ? 'bg-primary text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'questions' && (
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-sm text-white/40">Loading...</p>
                    ) : (
                        <>
                            {questions.map((q) => (
                                <QuestionCard key={q.id} question={q} onRefresh={fetchQuestions} tagSuggestions={tagSuggestions} config={config} showToast={showToast} />
                            ))}
                            <NewQuestionForm onCreated={() => { fetchQuestions(); fetchTagSuggestions(); }} config={config} showToast={showToast} />
                        </>
                    )}
                </div>
            )}

            {activeTab === 'roles' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <GlassCard className="!p-5" noHover>
                        <h3 className="text-sm font-bold text-white mb-3">Career Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {tagSuggestions.careerCategories.map((c) => (
                                <span key={c} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">{c}</span>
                            ))}
                            {tagSuggestions.careerCategories.length === 0 && <p className="text-xs text-white/40">None configured yet.</p>}
                        </div>
                    </GlassCard>
                    <GlassCard className="!p-5" noHover>
                        <h3 className="text-sm font-bold text-white mb-3">Career Roles</h3>
                        <div className="flex flex-wrap gap-2">
                            {tagSuggestions.careerRoles.map((c) => (
                                <span key={c} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">{c}</span>
                            ))}
                            {tagSuggestions.careerRoles.length === 0 && <p className="text-xs text-white/40">None configured yet.</p>}
                        </div>
                    </GlassCard>
                    <GlassCard className="!p-5" noHover>
                        <h3 className="text-sm font-bold text-white mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {tagSuggestions.skills.map((c) => (
                                <span key={c} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">{c}</span>
                            ))}
                            {tagSuggestions.skills.length === 0 && <p className="text-xs text-white/40">None configured yet.</p>}
                        </div>
                    </GlassCard>
                    <p className="sm:col-span-3 text-xs text-white/40">
                        These are pulled from answer mappings and course metadata. Add new ones directly in a question's answer mapping fields or in a course's Career &amp; Skills Mapping section - they'll appear here once used.
                    </p>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    {!analytics ? (
                        <p className="text-sm text-white/40">Loading...</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard label="Started" value={analytics.started} icon={Users} />
                                <StatCard label="Completed" value={analytics.completed} icon={CheckCircle2} />
                                <StatCard label="Completion" value={`${analytics.completionRate}%`} icon={Award} />
                                <StatCard label="Avg. Time" value={analytics.avgCompletionSeconds ? `${Math.round(analytics.avgCompletionSeconds / 60)}m` : '-'} icon={Clock} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <RankedList title="Top Career Goals" items={analytics.topGoals} />
                                <RankedList title="Top Career Interests" items={analytics.topInterests} />
                                <RankedList title="Top Job Roles" items={analytics.topJobRoles} />
                                <RankedList title="Top Skills" items={analytics.topSkills} />
                                <RankedList title="Most Recommended Courses" items={analytics.topRecommendedCourses} />
                                <GlassCard className="!p-5" noHover>
                                    <h3 className="text-sm font-bold text-white mb-3">Finder &rarr; Enrollment Conversion</h3>
                                    <div className="text-2xl font-extrabold text-primary">{analytics.conversions}</div>
                                    <p className="text-xs text-white/40 mt-1">Completed attempts that led to an enrollment in a recommended course.</p>
                                </GlassCard>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'preview' && (
                <PreviewPanel config={config} showToast={showToast} />
            )}
        </div>
    );
};

const PreviewPanel = ({ config, showToast }) => {
    const [step, setStep] = useState('idle');
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [result, setResult] = useState(null);

    const start = async () => {
        try {
            const { data: qData } = await axios.get('/api/course-finder/questions', config);
            const { data: startData } = await axios.post('/api/course-finder/attempts', { isPreview: true }, config);
            setQuestions(qData);
            setAttemptId(startData.attemptId);
            setStep('quiz');
        } catch {
            showToast('Failed to start preview', 'error');
        }
    };

    const handleAnalyzingDone = async () => {
        try {
            const { data } = await axios.get(`/api/course-finder/attempts/${attemptId}/result`, config);
            setResult(data);
            setStep('results');
        } catch {
            showToast('Failed to load preview result', 'error');
        }
    };

    if (step === 'idle') {
        return (
            <GlassCard className="!p-8 text-center" noHover>
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                    <Compass size={26} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Preview the live Course Finder</h3>
                <p className="text-sm text-white/50 mb-5 max-w-md mx-auto">
                    Runs the exact student experience - question order, required validation, scoring - without affecting any real student data or analytics.
                </p>
                <ModernButton onClick={start}><PlayCircle size={14} /> Start Preview</ModernButton>
            </GlassCard>
        );
    }

    return (
        <div className="rounded-3xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-black/40">
                <span className="text-xs font-semibold text-white/50">Preview mode - no student data is affected</span>
                <button onClick={() => setStep('idle')} className="text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1">
                    <X size={13} /> Close Preview
                </button>
            </div>
            {step === 'quiz' && (
                <CourseFinderWizard
                    attemptId={attemptId}
                    questions={questions}
                    initialResponses={[]}
                    initialIndex={0}
                    onComplete={() => setStep('analyzing')}
                    onExit={() => setStep('idle')}
                />
            )}
            {step === 'analyzing' && <CourseFinderAnalyzing onDone={handleAnalyzingDone} />}
            {step === 'results' && <CourseFinderResults result={result} interestAreas={[]} onRetake={start} />}
        </div>
    );
};

export default CourseFinderManager;
