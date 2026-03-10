import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InteractiveContentBuilder from '../../components/InteractiveContentBuilder';
import DashboardHeading from '../../components/ui/DashboardHeading';

const CreateInteractiveContent = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();

    const handleSave = (savedContent) => {
        console.log('Content saved:', savedContent);
        navigate(`/university/courses/${courseId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeading
                    title="Create Interactive Content"
                    subtitle="Add exercises, practices, or quizzes to your course module"
                />
                
                <div className="mt-8">
                    <InteractiveContentBuilder
                        moduleId={moduleId}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateInteractiveContent;
