import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Upload, FileText, Plus, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import QuestionBuilder from './QuestionBuilder';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ExamCreator = ({ examId, examType: initialExamType, onSuccess }) => {
    const [examType, setExamType] = useState(initialExamType);
    const [showSelector, setShowSelector] = useState(initialExamType === 'pdf-based');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const { showToast } = useToast();

    const handlePDFUpload = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            setUploadError('Please select a PDF file');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadProgress(0);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const formData = new FormData();
            formData.append('questionPaper', pdfFile);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                timeout: 120000 // 2 minute timeout for large files
            };

            const response = await axios.post(`/api/exams/${examId}/question-paper`, formData, config);
            
            setUploadSuccess(true);
            showToast('Question paper uploaded successfully', 'success');
            if (onSuccess) onSuccess(response.data);
            
            setTimeout(() => {
                setPdfFile(null);
                setUploadProgress(0);
                setUploadSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Upload error:', err);
            
            let errorMsg = 'Failed to upload question paper';
            
            if (err.code === 'ECONNABORTED') {
                errorMsg = 'Upload timeout. Please check your connection and try again with a smaller file.';
            } else if (err.response) {
                errorMsg = err.response.data?.message || errorMsg;
                
                // Handle specific error cases
                if (err.response.status === 400) {
                    errorMsg = 'Invalid file. ' + errorMsg;
                } else if (err.response.status === 403) {
                    errorMsg = 'Not authorized to upload question paper for this exam.';
                } else if (err.response.status === 413) {
                    errorMsg = 'File too large. Maximum size is 10MB.';
                }
            } else if (err.request) {
                errorMsg = 'Network error. Please check your connection and try again.';
            }
            
            setUploadError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setUploadError('Only PDF files are allowed');
                setPdfFile(null);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                setPdfFile(null);
                return;
            }
            setPdfFile(file);
            setUploadError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setUploadError('Only PDF files are allowed');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }
            setPdfFile(file);
            setUploadError('');
        }
    };

    if (examType === 'pdf-based' && showSelector) {
        return (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Online MCQ Option - HIGHLIGHTED */}
                <GlassCard className="relative p-8 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group cursor-pointer overflow-hidden" onClick={() => setExamType('online-mcq')}>
                    <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-lg">Recommended</div>
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all" />
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Digital MCQ Assessment</h3>
                        <p className="text-sm text-white/50 mb-8 leading-relaxed">
                            Create interactive exams with automatic grading. Support for negative marks and 1-click Excel bulk import.
                        </p>
                        <div className="space-y-3 mb-8">
                            {['Automatic Real-time Grading', 'Excel Template Support', 'Anti-Cheat Protection', 'Instant Results Delivery'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <ModernButton className="w-full !py-4 shadow-xl shadow-primary/20">
                            Build Online Exam
                        </ModernButton>
                    </div>
                </GlassCard>

                {/* PDF Based Option */}
                <GlassCard className="p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer" onClick={() => setShowSelector(false)}>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Traditional PDF Exam</h3>
                    <p className="text-sm text-white/50 mb-8 leading-relaxed">
                        Upload a physical question paper. Students will view the PDF and upload their scanned answer sheets manually.
                    </p>
                    <div className="space-y-3 mb-8">
                        {['Manual Grading Required', 'PDF Paper Upload', 'Scanned Answer Sheets', 'Standard Offline Flow'].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                {feature}
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white transition-all">
                        Proceed with Upload
                    </button>
                </GlassCard>
            </div>
        );
    }

    if (examType === 'pdf-based') {
        return (
            <GlassCard className="p-10 border-white/10 relative overflow-hidden">
                <button 
                    onClick={() => setShowSelector(true)}
                    className="absolute top-6 left-6 text-[10px] font-black text-white/20 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={14} />
                    Change Mode
                </button>

                <div className="flex flex-col items-center text-center mb-10 mt-4">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Deploy Question Paper</h3>
                    <p className="text-sm text-white/40 max-w-md">Your exam is currently set to PDF-based mode. Please upload the master document below.</p>
                </div>

                <form onSubmit={handlePDFUpload} className="space-y-8">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all group ${
                            pdfFile 
                                ? 'border-indigo-500/50 bg-indigo-500/5' 
                                : 'border-white/10 hover:border-indigo-500/30 bg-white/[0.01]'
                        }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                        
                        <div className="flex flex-col items-center">
                            <div className={`p-6 rounded-full mb-4 transition-all ${pdfFile ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/20 group-hover:bg-indigo-500/10 group-hover:text-indigo-400'}`}>
                                <Upload size={40} />
                            </div>
                            {pdfFile ? (
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white">{pdfFile.name}</p>
                                    <p className="text-xs font-black text-indigo-400/60 uppercase tracking-widest">
                                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Deploy
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPdfFile(null);
                                            setUploadError('');
                                        }}
                                        className="mt-4 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Discard File
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white/60 font-bold mb-1">
                                        Drag & Drop Document
                                    </p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
                                        Strictly PDF format • Max 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploading && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Uploading to Secure Vault</span>
                                <span className="text-sm font-black text-indigo-400">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {uploadSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400"
                            >
                                <CheckCircle size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Document successfully linked to session</span>
                            </motion.div>
                        )}

                        {uploadError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400"
                            >
                                <AlertCircle size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">{uploadError}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ModernButton
                        type="submit"
                        disabled={!pdfFile || uploading}
                        className="w-full !py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20"
                    >
                        {uploading ? 'Processing Deployment...' : 'Finalize PDF Deployment'}
                    </ModernButton>
                </form>
            </GlassCard>
        );
    }

    // For online exams (MCQ, descriptive, or mixed)
    return <QuestionBuilder examId={examId} examType={examType} onSuccess={onSuccess} />;
};

export default ExamCreator;
