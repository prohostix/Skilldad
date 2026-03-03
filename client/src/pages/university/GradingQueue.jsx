import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ManualGradingQueue from '../../components/ManualGradingQueue';
import DashboardHeading from '../../components/ui/DashboardHeading';
import GlassCard from '../../components/ui/GlassCard';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const GradingQueue = () => {
    const { courseId } = useParams();
    const { user } = useUser();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            const { data } = await axios.get(`/api/courses/${courseId}`, config);
            setCourse(data);
        } catch (err) {
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeading
                    title="Manual Grading Queue"
                    subtitle={course ? `Grade submissions for ${course.title}` : 'Grade student submissions'}
                />

                <div className="mt-8">
                    {courseId ? (
                        <ManualGradingQueue courseId={courseId} />
                    ) : (
                        <GlassCard className="text-center py-12">
                            <p className="text-slate-400">Please select a course to view grading queue</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradingQueue;
