import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ExamCreator from '../../components/ExamCreator';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const ExamQuestionManager = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExamDetails();
    }, [examId]);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data } = await axios.get(`/api/exams/${examId}`, config);
            setExam(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching exam:', err);
            setError(err.response?.data?.message || 'Failed to load exam details');
            setLoading(false);
            showToast('Failed to load exam details', 'error');
        }
    };

    const handleSuccess = () => {
        showToast('Questions saved successfully!', 'success');
        navigate('/university/exam-management');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-lg">Loading exam details...</div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="space-y-6">
                <ModernButton onClick={() => navigate('/university/exam-management')} variant="secondary">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Exam Management
                </ModernButton>
                <GlassCard className="p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle size={64} className="text-red-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Error Loading Exam</h3>
                        <p className="text-white/60 text-center">{error || 'Exam not found'}</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <ModernButton onClick={() => navigate('/university/exam-management')} variant="secondary" className="mb-4">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Exam Management
                    </ModernButton>
                    <DashboardHeading title={`Manage Questions: ${exam.title}`} />
                    <p className="text-white/50 mt-2">
                        Course: {exam.course?.title || 'N/A'} • Type: {exam.examType?.replace('-', ' ').toUpperCase()} • Duration: {exam.duration} mins
                    </p>
                </div>
            </div>

            <GlassCard className="p-6">
                <ExamCreator 
                    examId={examId} 
                    examType={exam.examType}
                    onSuccess={handleSuccess}
                />
            </GlassCard>
        </div>
    );
};

export default ExamQuestionManager;
