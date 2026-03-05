import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ModernButton from './ui/ModernButton';
import QuestionBuilder from './QuestionBuilder';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ExamCreator = ({ examId, examType, onSuccess }) => {
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

    if (examType === 'pdf-based') {
        return (
            <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Upload Question Paper</h3>
                        <p className="text-sm text-white/50">Upload PDF question paper for students</p>
                    </div>
                </div>

                <form onSubmit={handlePDFUpload} className="space-y-6">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
                            pdfFile 
                                ? 'border-primary/50 bg-primary/5' 
                                : 'border-white/20 hover:border-primary/30 bg-white/[0.02]'
                        }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                        
                        <div className="text-center">
                            <Upload size={48} className={`mx-auto mb-4 ${pdfFile ? 'text-primary' : 'text-white/30'}`} />
                            {pdfFile ? (
                                <div className="space-y-2">
                                    <p className="text-white font-semibold">{pdfFile.name}</p>
                                    <p className="text-sm text-white/50">
                                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPdfFile(null);
                                            setUploadError('');
                                        }}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white/70 mb-2">
                                        Drag and drop your PDF here, or click to browse
                                    </p>
                                    <p className="text-xs text-white/40">
                                        Maximum file size: 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-gradient-to-r from-primary to-primary-light"
                                />
                            </div>
                        </div>
                    )}

                    {uploadSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400"
                        >
                            <CheckCircle size={20} />
                            <span className="text-sm font-semibold">Question paper uploaded successfully!</span>
                        </motion.div>
                    )}

                    {uploadError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                        >
                            <AlertCircle size={20} />
                            <span className="text-sm">{uploadError}</span>
                        </motion.div>
                    )}

                    <ModernButton
                        type="submit"
                        disabled={!pdfFile || uploading}
                        className="w-full"
                    >
                        <Upload size={18} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Question Paper'}
                    </ModernButton>
                </form>
            </GlassCard>
        );
    }

    // For online exams (MCQ, descriptive, or mixed)
    return <QuestionBuilder examId={examId} examType={examType} onSuccess={onSuccess} />;
};

export default ExamCreator;
