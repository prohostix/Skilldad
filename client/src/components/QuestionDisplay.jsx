import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const QuestionDisplay = ({ question, questionNumber, totalQuestions, answer, onAnswerChange }) => {
    if (!question) return null;

    const handleMCQChange = (optionIndex) => {
        onAnswerChange({ selectedOption: optionIndex });
    };

    const handleDescriptiveChange = (e) => {
        onAnswerChange({ textAnswer: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg">
                        <span className="text-sm font-black">
                            Question {questionNumber} of {totalQuestions}
                        </span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 text-white/60 rounded-lg">
                        <span className="text-xs font-bold">
                            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                        </span>
                    </div>
                    {question.questionType === 'mcq' && question.negativeMarks > 0 && (
                        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg">
                            <span className="text-xs font-bold">
                                -{question.negativeMarks} for wrong answer
                            </span>
                        </div>
                    )}
                </div>
                
                {question.difficulty && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                        question.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        question.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                        {question.difficulty}
                    </div>
                )}
            </div>

            {/* Question Text */}
            <div className="space-y-4">
                <div className="text-white text-lg leading-relaxed">
                    {question.questionText}
                </div>

                {/* Question Image (if any) */}
                {question.questionImage && (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                        <img
                            src={question.questionImage}
                            alt="Question"
                            className="w-full max-w-2xl"
                        />
                    </div>
                )}
            </div>

            {/* Answer Input */}
            <div className="pt-4">
                {question.questionType === 'mcq' ? (
                    /* MCQ Options */
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = answer?.selectedOption === index;
                            
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleMCQChange(index)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            isSelected
                                                ? 'border-primary bg-primary'
                                                : 'border-white/30'
                                        }`}>
                                            {isSelected && (
                                                <CheckCircle size={16} className="text-white" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-black px-2 py-1 rounded ${
                                                    isSelected
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white/10 text-white/60'
                                                }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span className={`text-base ${
                                                    isSelected ? 'text-white font-semibold' : 'text-white/80'
                                                }`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    /* Descriptive Answer */
                    <div className="space-y-3">
                        <label className="block">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white/70">Your Answer</span>
                                <span className="text-xs text-white/40">
                                    {answer?.textAnswer?.length || 0} / 10,000 characters
                                </span>
                            </div>
                            <textarea
                                value={answer?.textAnswer || ''}
                                onChange={handleDescriptiveChange}
                                placeholder="Type your answer here..."
                                maxLength={10000}
                                rows={12}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/10 transition-all resize-none"
                            />
                        </label>
                        
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Circle size={4} className="fill-current" />
                            <span>Your answer is being auto-saved</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tags (if any) */}
            {question.tags && question.tags.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <span className="text-xs text-white/40 font-bold">Topics:</span>
                    <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-white/5 text-white/60 rounded text-xs font-semibold"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionDisplay;
