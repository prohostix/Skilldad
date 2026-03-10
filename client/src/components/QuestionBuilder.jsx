import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const QuestionBuilder = ({ examId, onSuccess }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchQuestions = useCallback(async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const response = await axios.get(`/api/exams/${examId}/questions`, config);
            // API returns { questions: [...] }, extract the questions array
            const questionsData = response.data.questions || response.data;
            setQuestions(Array.isArray(questionsData) ? questionsData : []);
        } catch (err) {
            console.error('Failed to fetch questions:', err);
            // Ensure questions remains an array even on error
            setQuestions([]);
        }
    }, [examId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const resetForm = () => {
        setCurrentQuestion({
            questionText: '',
            questionType: 'mcq',
            options: ['', '', '', ''],
            correctAnswer: 0,
            marks: 1,
            negativeMarks: 0
        });
        setEditingIndex(null);
    };

    const handleAddQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            showToast('Please enter question text', 'error');
            return;
        }

        if (currentQuestion.questionType === 'mcq') {
            const filledOptions = currentQuestion.options.filter(opt => opt.trim());
            if (filledOptions.length < 2) {
                showToast('Please provide at least 2 options for MCQ', 'error');
                return;
            }
        }

        // Ensure questions is always an array
        const currentQuestions = Array.isArray(questions) ? questions : [];

        if (editingIndex !== null) {
            const updatedQuestions = [...currentQuestions];
            updatedQuestions[editingIndex] = {
                ...currentQuestion,
                order: editingIndex + 1
            };
            setQuestions(updatedQuestions);
            showToast('Question updated', 'success');
        } else {
            setQuestions([...currentQuestions, {
                ...currentQuestion,
                order: currentQuestions.length + 1
            }]);
            showToast('Question added', 'success');
        }

        resetForm();
    };

    const handleEditQuestion = (index) => {
        const question = questions[index];
        
        if (!question) {
            console.error('Question not found at index:', index);
            return;
        }
        
        // Convert database format to local format if needed
        let options = ['', '', '', ''];
        let correctAnswer = 0;
        
        // Handle options - could be strings (local) or objects (from DB)
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
            if (typeof question.options[0] === 'object' && question.options[0] !== null) {
                // Database format: [{text: "...", isCorrect: true}, ...]
                const correctIndex = question.options.findIndex(opt => opt.isCorrect === true);
                options = question.options.map(opt => opt.text || '');
                correctAnswer = correctIndex >= 0 ? correctIndex : 0;
            } else {
                // Local format: ["option1", "option2", ...]
                options = [...question.options];
                correctAnswer = question.correctAnswer || 0;
            }
        } else if (question.correctAnswer !== undefined) {
            // Fallback if options is missing but correctAnswer exists
            correctAnswer = question.correctAnswer;
        }
        
        setCurrentQuestion({
            questionText: question.questionText || '',
            questionType: question.questionType || 'mcq',
            options: options,
            correctAnswer: correctAnswer,
            marks: question.marks || 1,
            negativeMarks: question.negativeMarks || 0
        });
        setEditingIndex(index);
    };

    const handleDeleteQuestion = (index) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = questions.filter((_, i) => i !== index);
            // Update order for remaining questions
            const reorderedQuestions = updatedQuestions.map((q, i) => ({
                ...q,
                order: i + 1
            }));
            setQuestions(reorderedQuestions);
            showToast('Question deleted', 'success');
        }
    };

    const handleSaveAllQuestions = async () => {
        if (questions.length === 0) {
            showToast('Please add at least one question', 'error');
            return;
        }

        setSaving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Get existing questions
            const existingResponse = await axios.get(`/api/exams/${examId}/questions`, config);
            const existingQuestions = existingResponse.data.questions || [];
            
            // Delete all existing questions first to avoid order conflicts
            if (existingQuestions.length > 0) {
                await Promise.all(
                    existingQuestions.map(q => 
                        axios.delete(`/api/questions/${q._id}`, config).catch(err => {
                            console.warn('Failed to delete question:', q._id, err);
                        })
                    )
                );
            }

            // Prepare all questions for saving (both new and updated)
            const questionsToSave = questions.map((q, index) => {
                let options = [];
                let correctAnswerIndex = q.correctAnswer || 0;
                
                // Handle options - could be strings (local) or objects (from DB)
                if (q.questionType === 'mcq' && q.options && Array.isArray(q.options)) {
                    if (typeof q.options[0] === 'object' && q.options[0] !== null) {
                        // Database format: [{text: "...", isCorrect: true}, ...]
                        options = q.options.map(opt => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect
                        }));
                    } else {
                        // Local format: ["option1", "option2", ...]
                        options = q.options
                            .filter(opt => typeof opt === 'string' && opt.trim())
                            .map((text, idx) => ({
                                text: text.trim(),
                                isCorrect: idx === correctAnswerIndex
                            }));
                    }
                }
                
                return {
                    questionText: q.questionText,
                    questionType: q.questionType,
                    options: options,
                    marks: Number(q.marks) || 1,
                    negativeMarks: Number(q.negativeMarks) || 0,
                    order: index + 1  // Reassign order sequentially
                };
            });

            console.log('Saving questions:', questionsToSave);

            await axios.post(
                `/api/exams/${examId}/questions`,
                { questions: questionsToSave },
                config
            );

            showToast('All questions saved successfully', 'success');
            await fetchQuestions();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Save questions error:', err);
            console.error('Error response:', err.response?.data);
            
            // Extract detailed error message
            let errorMsg = 'Failed to save questions';
            if (err.response?.data) {
                const data = err.response.data;
                if (data.errors && Array.isArray(data.errors)) {
                    // Show validation errors for each question
                    errorMsg = 'Validation errors:\n' + data.errors.map(e => 
                        `Question ${e.questionIndex + 1}: ${e.errors.join(', ')}`
                    ).join('\n');
                } else if (data.message) {
                    errorMsg = data.message;
                }
            }
            
            console.error('Formatted error:', errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addOption = () => {
        if (currentQuestion.options.length < 6) {
            setCurrentQuestion({
                ...currentQuestion,
                options: [...currentQuestion.options, '']
            });
        }
    };

    const removeOption = (index) => {
        if (currentQuestion.options.length > 2) {
            const newOptions = currentQuestion.options.filter((_, i) => i !== index);
            setCurrentQuestion({
                ...currentQuestion,
                options: newOptions,
                correctAnswer: currentQuestion.correctAnswer >= index ? Math.max(0, currentQuestion.correctAnswer - 1) : currentQuestion.correctAnswer
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Question Form */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                    {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                </h3>

                <div className="space-y-6">
                    {/* Question Type */}
                    <div>
                        <label className="block text-sm font-semibold text-white/70 mb-2">
                            Question Type
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setCurrentQuestion({ ...currentQuestion, questionType: 'mcq' })}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                    currentQuestion.questionType === 'mcq'
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                Multiple Choice
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentQuestion({ ...currentQuestion, questionType: 'descriptive' })}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                    currentQuestion.questionType === 'descriptive'
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                Descriptive
                            </button>
                        </div>
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-semibold text-white/70 mb-2">
                            Question Text *
                        </label>
                        <textarea
                            value={currentQuestion.questionText}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                            placeholder="Enter your question here..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>

                    {/* MCQ Options */}
                    {currentQuestion.questionType === 'mcq' && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-white/70">
                                    Options (Select correct answer)
                                </label>
                                {currentQuestion.options.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Add Option
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={currentQuestion.correctAnswer === index}
                                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                                            className="w-5 h-5 text-primary focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all"
                                        />
                                        {currentQuestion.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Marks */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-white/70 mb-2">
                                Marks *
                            </label>
                            <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={currentQuestion.marks || 1}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setCurrentQuestion({ ...currentQuestion, marks: isNaN(value) ? 1 : value });
                                }}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        {currentQuestion.questionType === 'mcq' && (
                            <div>
                                <label className="block text-sm font-semibold text-white/70 mb-2">
                                    Negative Marks
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    value={currentQuestion.negativeMarks || 0}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setCurrentQuestion({ ...currentQuestion, negativeMarks: isNaN(value) ? 0 : value });
                                    }}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {editingIndex !== null && (
                            <ModernButton
                                variant="secondary"
                                onClick={resetForm}
                                className="flex-1"
                            >
                                <X size={18} className="mr-2" />
                                Cancel
                            </ModernButton>
                        )}
                        <ModernButton
                            onClick={handleAddQuestion}
                            className="flex-1"
                        >
                            {editingIndex !== null ? (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Update Question
                                </>
                            ) : (
                                <>
                                    <Plus size={18} className="mr-2" />
                                    Add Question
                                </>
                            )}
                        </ModernButton>
                    </div>
                </div>
            </GlassCard>

            {/* Questions List */}
            {questions.length > 0 && (
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">
                            Questions List ({questions.length})
                        </h3>
                        <ModernButton
                            onClick={handleSaveAllQuestions}
                            disabled={saving}
                        >
                            <Save size={18} className="mr-2" />
                            {saving ? 'Saving...' : 'Save All Questions'}
                        </ModernButton>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {questions.map((question, index) => (
                                <motion.div
                                    key={question._id || `question-${index}-${question.questionText?.substring(0, 20)}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-bold">
                                                    Q{index + 1}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                    question.questionType === 'mcq'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                    {question.questionType === 'mcq' ? 'MCQ' : 'Descriptive'}
                                                </span>
                                                <span className="text-sm text-white/50">
                                                    {question.marks} marks
                                                </span>
                                                {question.questionType === 'mcq' && question.negativeMarks > 0 && (
                                                    <span className="text-sm text-red-400">
                                                        -{question.negativeMarks} for wrong
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white mb-3">{question.questionText}</p>
                                            {question.questionType === 'mcq' && question.options && (
                                                <div className="space-y-2">
                                                    {question.options.map((option, optIndex) => {
                                                        // Handle both string options (local) and object options (from DB)
                                                        const optionText = typeof option === 'string' ? option : option.text;
                                                        const isCorrect = typeof option === 'string' 
                                                            ? optIndex === question.correctAnswer 
                                                            : option.isCorrect;
                                                        
                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                                                    isCorrect
                                                                        ? 'bg-green-500/10 border border-green-500/20'
                                                                        : 'bg-white/5'
                                                                }`}
                                                            >
                                                                {isCorrect && (
                                                                    <CheckCircle size={16} className="text-green-400" />
                                                                )}
                                                                <span className={`text-sm ${
                                                                    isCorrect
                                                                        ? 'text-green-400 font-semibold'
                                                                        : 'text-white/70'
                                                                }`}>
                                                                    {optionText}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditQuestion(index)}
                                                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(index)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default QuestionBuilder;
