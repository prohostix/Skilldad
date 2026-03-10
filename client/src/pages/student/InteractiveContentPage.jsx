import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InteractiveContentPlayer from '../../components/InteractiveContentPlayer';
import DashboardHeading from '../../components/ui/DashboardHeading';

const InteractiveContentPage = () => {
    const { courseId, contentId } = useParams();
    const navigate = useNavigate();

    const handleComplete = (submissionData) => {
        console.log('Submission completed:', submissionData);
        // Optionally navigate back to course or show success message
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeading
                    title="Interactive Content"
                    subtitle="Complete the exercise, practice, or quiz below"
                />
                
                <div className="mt-8">
                    <InteractiveContentPlayer
                        contentId={contentId}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        </div>
    );
};

export default InteractiveContentPage;
