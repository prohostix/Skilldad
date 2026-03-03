import React from 'react';
import { useParams } from 'react-router-dom';
import InteractiveContentManager from '../../components/InteractiveContentManager';
import DashboardHeading from '../../components/ui/DashboardHeading';

const ManageInteractiveContent = () => {
    const { courseId, moduleId } = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeading
                    title="Manage Interactive Content"
                    subtitle="View, edit, delete, and reorder interactive content in this module"
                />
                
                <div className="mt-8">
                    <InteractiveContentManager />
                </div>
            </div>
        </div>
    );
};

export default ManageInteractiveContent;
