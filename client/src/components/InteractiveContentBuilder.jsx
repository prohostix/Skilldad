import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Save,
    Eye,
    ChevronUp,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';

const InteractiveContentBuilder = ({ moduleId, initialContent, onSave, isEditing = false }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState(initialContent || {
        title: '',
        description: '',
        instructions: '',
        contentType: 'exercise',
        timeLimit: 0,
        attemptLimit: -1,
        passingScore: 70,
        showSolutionAfter: 'submission',
        questions: []
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice' },
        { value: 'true-false', label: 'True/False' },
        { value: 'short-answer', label: 'Short Answer' },
        { value: 'code-submission', label: 'Code Submission' },
        { value: 'essay', label: 'Essay' }
    ];

    const contentTypes = [
        { value: 'exercise', label: 'Exercise' },
        { value: 'practice', label: 'Practice' },
        { value: 'quiz', label: 'Quiz' }
    ];

    const addQuestion = () => {
        const newQuestion = {
            type: 'multiple-choice',
            questionText: '',
            points: 10,
            options: ['', ''],
            correctAnswer: '',
            acceptedAnswers: [],
            solution: '',
            explanation: ''
        };
        setContent(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const removeQuestion = (index) => {
        setContent(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const moveQuestion = (index, direction) => {
        const newQuestions = [...content.questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
        
        [newQuestions[index], newQuestions[targetIndex]] = 
        [newQuestions[targetIndex], newQuestions[index]];
        
        setContent(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateQuestion = (index, field, value) => {
        setContent(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const addOption = (questionIndex) => {
        const question = content.questions[questionIndex];
        updateQuestion(questionIndex, 'options', [...question.options, '']);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const question = content.questions[questionIndex];
        updateQuestion(
            questionIndex,
            'options',
            question.options.filter((_, i) => i !== optionIndex)
        );
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const question = content.questions[questionIndex];
        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        updateQuestion(questionIndex, 'options', newOptions);
    };

    const validateContent = () => {
        if (!content.title.trim()) {
            setError('Title is required');
            return false;
        }

        if (content.questions.length === 0) {
            setError('At least one question is required');
            return false;
        }

        for (let i = 0; i < content.questions.length; i++) {
            const q = content.questions[i];
            
            if (!q.questionText.trim()) {
                setError(`Question ${i + 1}: Question text is required`);
                return false;
            }

            if (q.points <= 0) {
                setError(`Question ${i + 1}: Points must be greater than 0`);
                return false;
            }

            if (q.type === 'multiple-choice') {
                if (q.options.length < 2) {
                    setError(`Question ${i + 1}: At least 2 options required`);
                    return false;
                }
                if (!q.correctAnswer) {
                    setError(`Question ${i + 1}: Correct answer is required`);
                    return false;
                }
            }

            if (q.type === 'true-false' && !q.correctAnswer) {
                setError(`Question ${i + 1}: Correct answer is required`);
                return false;
            }

            if (q.type === 'short-answer' && q.acceptedAnswers.length === 0) {
                setError(`Question ${i + 1}: At least one accepted answer required`);
                return false;
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateContent()) return;

        try {
            setSaving(true);
            
            if (onSave) {
                // If onSave is provided, use it (for edit mode)
                await onSave(content);
            } else {
                // Otherwise, create new content
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                const { data } = await axios.post(
                    `/api/courses/${courseId}/modules/${moduleId}/content`,
                    content,
                    config
                );

                navigate(`/university/courses/${courseId}`);
            }
        } catch (err) {
            console.error('Error saving content:', err);
            setError(err.response?.data?.message || 'Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const renderQuestionForm = (question, index) => {
        return (
            <GlassCard key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Question {index + 1}</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                        >
                            <ChevronUp size={16} className="text-white" />
                        </button>
                        <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === content.questions.length - 1}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                        >
                            <ChevronDown size={16} className="text-white" />
                        </button>
                        <button
                            onClick={() => removeQuestion(index)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                        >
                            <Trash2 size={16} className="text-red-400" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Question Type */}
                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Question Type</label>
                        <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        >
                            {questionTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Question Text</label>
                        <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Enter your question..."
                        />
                    </div>

                    {/* Points */}
                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Points</label>
                        <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Type-specific fields */}
                    {question.type === 'multiple-choice' && (
                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">Options</label>
                            {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                        placeholder={`Option ${optIndex + 1}`}
                                    />
                                    {question.options.length > 2 && (
                                        <button
                                            onClick={() => removeOption(index, optIndex)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                        >
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {question.options.length < 10 && (
                                <button
                                    onClick={() => addOption(index)}
                                    className="text-sm text-primary hover:text-primary/80 font-bold"
                                >
                                    + Add Option
                                </button>
                            )}
                            <div className="mt-4">
                                <label className="block text-sm text-slate-400 font-bold mb-2">Correct Answer</label>
                                <select
                                    value={question.correctAnswer}
                                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select correct answer</option>
                                    {question.options.map((opt, i) => (
                                        <option key={i} value={opt}>{opt || `Option ${i + 1}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {question.type === 'true-false' && (
                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">Correct Answer</label>
                            <select
                                value={question.correctAnswer}
                                onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            >
                                <option value="">Select answer</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>
                    )}

                    {question.type === 'short-answer' && (
                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">
                                Accepted Answers (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={question.acceptedAnswers.join(', ')}
                                onChange={(e) => updateQuestion(
                                    index,
                                    'acceptedAnswers',
                                    e.target.value.split(',').map(a => a.trim())
                                )}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                placeholder="answer1, answer2, answer3"
                            />
                        </div>
                    )}

                    {question.type === 'code-submission' && (
                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">Programming Language</label>
                            <input
                                type="text"
                                value={question.language || ''}
                                onChange={(e) => updateQuestion(index, 'language', e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                placeholder="e.g., JavaScript, Python, Java"
                            />
                        </div>
                    )}

                    {/* Solution & Explanation */}
                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Solution (Optional)</label>
                        <textarea
                            value={question.solution}
                            onChange={(e) => updateQuestion(index, 'solution', e.target.value)}
                            rows="2"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Provide the solution..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Explanation (Optional)</label>
                        <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                            rows="2"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Explain the answer..."
                        />
                    </div>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            {error && (
                <GlassCard className="bg-red-500/10 border-red-500/20">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={20} className="text-red-400" />
                        <p className="text-red-400 font-bold text-sm">{error}</p>
                    </div>
                </GlassCard>
            )}

            {/* Basic Info */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-extrabold text-white font-poppins mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Content Type</label>
                        <select
                            value={content.contentType}
                            onChange={(e) => setContent(prev => ({ ...prev, contentType: e.target.value }))}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        >
                            {contentTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Title</label>
                        <input
                            type="text"
                            value={content.title}
                            onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            placeholder="Enter title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Description</label>
                        <textarea
                            value={content.description}
                            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                            rows="3"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Enter description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Instructions</label>
                        <textarea
                            value={content.instructions}
                            onChange={(e) => setContent(prev => ({ ...prev, instructions: e.target.value }))}
                            rows="3"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Enter instructions for students..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">
                                Time Limit (minutes, 0 = none)
                            </label>
                            <input
                                type="number"
                                value={content.timeLimit}
                                onChange={(e) => setContent(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                                min="0"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 font-bold mb-2">
                                Attempt Limit (-1 = unlimited)
                            </label>
                            <input
                                type="number"
                                value={content.attemptLimit}
                                onChange={(e) => setContent(prev => ({ ...prev, attemptLimit: parseInt(e.target.value) }))}
                                min="-1"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        {content.contentType === 'quiz' && (
                            <div>
                                <label className="block text-sm text-slate-400 font-bold mb-2">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    value={content.passingScore}
                                    onChange={(e) => setContent(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 font-bold mb-2">Show Solution</label>
                        <select
                            value={content.showSolutionAfter}
                            onChange={(e) => setContent(prev => ({ ...prev, showSolutionAfter: e.target.value }))}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                        >
                            <option value="immediate">Immediately</option>
                            <option value="submission">After Submission</option>
                            <option value="never">Never</option>
                        </select>
                    </div>
                </div>
            </GlassCard>

            {/* Questions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold text-white font-poppins">
                        Questions ({content.questions.length})
                    </h2>
                    <ModernButton onClick={addQuestion} variant="secondary">
                        <Plus size={20} className="mr-2" />
                        Add Question
                    </ModernButton>
                </div>

                <div className="space-y-4">
                    {content.questions.map((question, index) => renderQuestionForm(question, index))}
                </div>

                {content.questions.length === 0 && (
                    <GlassCard className="text-center py-12">
                        <p className="text-slate-400 mb-4">No questions added yet</p>
                        <ModernButton onClick={addQuestion}>
                            <Plus size={20} className="mr-2" />
                            Add First Question
                        </ModernButton>
                    </GlassCard>
                )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
                <ModernButton
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 !py-4"
                >
                    <Save size={20} className="mr-2" />
                    {saving ? 'Saving...' : (isEditing ? 'Update Content' : 'Save Content')}
                </ModernButton>
                
                <ModernButton
                    onClick={() => navigate(-1)}
                    variant="secondary"
                    className="!py-4"
                >
                    Cancel
                </ModernButton>
            </div>
        </div>
    );
};

export default InteractiveContentBuilder;
