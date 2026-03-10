import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Divider, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [openModule, setOpenModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    const fetchCourse = async () => {
        try {
            const { data } = await axios.get(`/api/courses/${id}`);
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.put(`/api/courses/${id}`, course, config);
            alert('Course Updated!');
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
            alert('Update failed');
        }
    };

    const handleAddModule = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post(`/api/courses/${id}/modules`, { title: newModuleTitle }, config);
            setOpenModule(false);
            setNewModuleTitle('');
            fetchCourse();
        } catch (error) {
            alert('Failed to add module');
        }
    };

    if (!course) return <Typography>Loading Editor...</Typography>;

    return (
        <Box maxWidth="lg" sx={{ mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>Edit Course: {course.title}</Typography>
                <form onSubmit={handleUpdate}>
                    <TextField
                        fullWidth label="Title"
                        value={course.title}
                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth multiline rows={4} label="Description"
                        value={course.description}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Instructor Name (Custom Override)"
                        value={course.instructorName || ''}
                        onChange={(e) => setCourse({ ...course, instructorName: e.target.value })}
                        sx={{ mb: 2 }}
                        placeholder="Manual override for instructor name"
                    />
                    <TextField
                        fullWidth label="University Name (Custom Override)"
                        value={course.universityName || ''}
                        onChange={(e) => setCourse({ ...course, universityName: e.target.value })}
                        sx={{ mb: 2 }}
                        placeholder="Manual override for university name"
                    />
                    <Button type="submit" variant="contained">Save Basic Info</Button>
                </form>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Modules & Videos</Typography>
                    <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setOpenModule(true)}>Add Module</Button>
                </Box>

                {course.modules.map((module) => (
                    <Accordion key={module._id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{module.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {module.videos.map((video) => (
                                    <ListItem key={video._id} secondaryAction={
                                        <IconButton edge="end"><DeleteIcon /></IconButton>
                                    }>
                                        <ListItemText primary={video.title} secondary={video.url} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button startIcon={<AddIcon />} size="small">Add Video</Button>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" sx={{ mb: 2 }}>Projects & Exams</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: 2, bgcolor: '#f1f5f9' }}>
                            <Typography variant="subtitle1" gutterBottom>Projects ({course.projects?.length || 0})</Typography>
                            <Button startIcon={<AddIcon />} size="small" variant="outlined">Add Project</Button>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: 2, bgcolor: '#f1f5f9' }}>
                            <Typography variant="subtitle1" gutterBottom>Exams/Assessments</Typography>
                            <Button startIcon={<AddIcon />} size="small" variant="outlined">Schedule Exam</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={openModule} onClose={() => setOpenModule(false)}>
                <DialogTitle>Add New Module</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth label="Module Title"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModule(false)}>Cancel</Button>
                    <Button onClick={handleAddModule} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseEditor;
