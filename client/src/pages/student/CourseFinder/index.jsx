import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseFinderWelcome from './CourseFinderWelcome';
import CourseFinderWizard from './CourseFinderWizard';
import CourseFinderAnalyzing from './CourseFinderAnalyzing';
import CourseFinderResults from './CourseFinderResults';

const authConfig = () => {
    const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return stored ? { headers: { Authorization: `Bearer ${stored.token}` } } : null;
};

// Orchestrates the full Course Finder journey: welcome -> quiz -> analyzing -> results.
// The server (course_finder_status + attempt status), not local state, is the source
// of truth for whether a student has an in-progress or completed attempt, so refreshing
// or returning later always resumes/redisplays the right step.
const CourseFinderPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('loading');
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [initialResponses, setInitialResponses] = useState([]);
    const [initialIndex, setInitialIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [interestAreas, setInterestAreas] = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const config = authConfig();
                if (!config) return;
                const { data: statusData } = await axios.get('/api/course-finder/status', config);

                if (statusData.status === 'COMPLETED') {
                    const { data: resultData } = await axios.get('/api/course-finder/my-result', config);
                    setResult(resultData);
                    setStep('results');
                    return;
                }

                if (statusData.status === 'IN_PROGRESS') {
                    const { data: qData } = await axios.get('/api/course-finder/questions', config);
                    const { data: startData } = await axios.post('/api/course-finder/attempts', {}, config);
                    const { data: respData } = await axios.get(`/api/course-finder/attempts/${startData.attemptId}/responses`, config);
                    setQuestions(qData);
                    setAttemptId(startData.attemptId);
                    setInitialResponses(respData.responses || []);
                    const answeredIds = new Set((respData.responses || []).map((r) => r.questionId));
                    const firstUnanswered = qData.findIndex((q) => !answeredIds.has(q.id));
                    setInitialIndex(firstUnanswered === -1 ? Math.max(0, qData.length - 1) : firstUnanswered);
                    setStep('quiz');
                    return;
                }

                setStep('welcome');
            } catch {
                setLoadError("We couldn't load the Course Finder. Please try again.");
                setStep('error');
            }
        };
        bootstrap();
    }, []);

    const handleStart = useCallback(async () => {
        try {
            const config = authConfig();
            const { data: qData } = await axios.get('/api/course-finder/questions', config);
            const { data: startData } = await axios.post('/api/course-finder/attempts', {}, config);
            setQuestions(qData);
            setAttemptId(startData.attemptId);
            setInitialResponses([]);
            setInitialIndex(0);
            setStep('quiz');
        } catch {
            setLoadError("We couldn't start the Course Finder. Please try again.");
            setStep('error');
        }
    }, []);

    const handleSkip = useCallback(async () => {
        try {
            await axios.put('/api/course-finder/dismiss', {}, authConfig());
        } catch { /* non-critical */ }
        navigate('/dashboard');
    }, [navigate]);

    const handleComplete = useCallback((completeData) => {
        setInterestAreas(completeData?.interestAreas || []);
        setStep('analyzing');
    }, []);

    const handleAnalyzingDone = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/course-finder/attempts/${attemptId}/result`, authConfig());
            setResult(data);
            setStep('results');
        } catch {
            setLoadError("We couldn't load your results. Please try again.");
            setStep('error');
        }
    }, [attemptId]);

    const handleRetake = useCallback(async () => {
        try {
            const config = authConfig();
            const { data: qData } = await axios.get('/api/course-finder/questions', config);
            const { data: startData } = await axios.post('/api/course-finder/attempts', {}, config);
            setQuestions(qData);
            setAttemptId(startData.attemptId);
            setInitialResponses([]);
            setInitialIndex(0);
            setResult(null);
            setStep('quiz');
        } catch {
            setLoadError("We couldn't start a new attempt. Please try again.");
            setStep('error');
        }
    }, []);

    if (step === 'loading') {
        return <div className="min-h-[calc(100vh-64px)]" style={{ background: '#FAF8FF' }} />;
    }

    if (step === 'error') {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" style={{ background: '#FAF8FF' }}>
                <div className="text-center max-w-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-4">{loadError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: '#4C1D95' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'welcome') {
        return <CourseFinderWelcome onStart={handleStart} onSkip={handleSkip} />;
    }

    if (step === 'quiz') {
        return (
            <CourseFinderWizard
                attemptId={attemptId}
                questions={questions}
                initialResponses={initialResponses}
                initialIndex={initialIndex}
                onComplete={handleComplete}
                onExit={() => navigate('/dashboard')}
            />
        );
    }

    if (step === 'analyzing') {
        return <CourseFinderAnalyzing onDone={handleAnalyzingDone} />;
    }

    return <CourseFinderResults result={result} interestAreas={interestAreas} onRetake={handleRetake} />;
};

export default CourseFinderPage;
