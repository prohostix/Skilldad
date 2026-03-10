
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestCourses = () => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/courses')
            .then(res => setCourses(res.data))
            .catch(err => setError(err.message));
    }, []);

    return (
        <div style={{ padding: '100px', color: 'white', background: 'black', minHeight: '100vh' }}>
            <h1>Test Courses Page</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <p>Count: {courses.length}</p>
            <ul>
                {courses.map(c => (
                    <li key={c._id}>{c.title} - {c.category}</li>
                ))}
            </ul>
        </div>
    );
};

export default TestCourses;
