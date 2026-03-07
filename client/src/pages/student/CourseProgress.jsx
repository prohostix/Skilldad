import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProgressDashboard from '../../components/ProgressDashboard';
import { useUser } from '../../context/UserContext';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';

const CourseProgress = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-white">Please log in to view your progress.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                        className="flex items-center text-slate-400 hover:text-primary mb-4 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Course
                    </button>
                    <DashboardHeading title="Course Progress" />
                    <p className="text-white/40 font-bold mt-2">
                        Track your learning journey and achievements
                    </p>
                </div>

                {/* Progress Dashboard Component */}
                <ProgressDashboard courseId={courseId} userId={user._id} />
            </div>
        </div>
    );
};

export default CourseProgress;
