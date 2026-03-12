import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Divider, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControlLabel, Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [openModule, setOpenModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    
    const [openVideo, setOpenVideo] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [newVideoData, setNewVideoData] = useState({ title: '', url: '' });
    
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const fileInputRef = React.useRef(null);

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

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Delete this module?')) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`/api/courses/${id}/modules/${moduleId}`, config);
            fetchCourse();
        } catch (error) {
            alert('Failed to delete module');
        }
    };

    const handleAddVideo = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post(`/api/courses/${id}/modules/${activeModuleId}/videos`, newVideoData, config);
            setOpenVideo(false);
            setNewVideoData({ title: '', url: '' });
            fetchCourse();
        } catch (error) {
            alert('Failed to add video');
        }
    };

    const handleDeleteVideo = async (moduleId, videoId) => {
        if (!window.confirm('Delete this video?')) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`/api/courses/${id}/modules/${moduleId}/videos/${videoId}`, config);
            fetchCourse();
        } catch (error) {
            alert('Failed to delete video');
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('thumbnail', file);

        setThumbnailUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.post(`/api/courses/${id}/upload-thumbnail`, formData, config);
            fetchCourse();
        } catch (error) {
            alert('Failed to upload thumbnail');
        } finally {
            setThumbnailUploading(false);
        }
    };

    if (!course) return <Typography>Loading Editor...</Typography>;

    return (
        <Box maxWidth="lg" sx={{ mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>Edit Course: {course.title}</Typography>
                
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box 
                        sx={{ 
                            width: 200, height: 120, bgcolor: '#f1f5f9', borderRadius: 2, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', border: '1px dashed #ccc'
                        }}
                    >
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Typography color="text.secondary">No Thumbnail</Typography>
                        )}
                    </Box>
                    <Box>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="thumbnail-upload"
                            type="file"
                            onChange={handleThumbnailUpload}
                        />
                        <label htmlFor="thumbnail-upload">
                            <Button variant="outlined" component="span" startIcon={<PhotoCamera />} disabled={thumbnailUploading}>
                                {thumbnailUploading ? 'Uploading...' : 'Upload Thumbnail'}
                            </Button>
                        </label>
                    </Box>
                </Box>

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
                    <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={course.isFeatured || false}
                                    onChange={(e) => setCourse({ ...course, isFeatured: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Featured in Top 3 on Landing Page"
                        />
                    </Box>
                    <Button type="submit" variant="contained">Save Changes</Button>
                </form>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Modules & Videos</Typography>
                    <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setOpenModule(true)}>Add Module</Button>
                </Box>

                {course.modules.map((module) => (
                    <Accordion key={module._id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                                <Typography>{module.title}</Typography>
                                <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {module.videos.map((video) => (
                                    <ListItem key={video._id} secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => handleDeleteVideo(module._id, video._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }>
                                        <ListItemText primary={video.title} secondary={video.url} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button 
                                startIcon={<AddIcon />} 
                                size="small"
                                onClick={() => { setActiveModuleId(module._id); setOpenVideo(true); }}
                            >
                                Add Video
                            </Button>
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

            <Dialog open={openVideo} onClose={() => setOpenVideo(false)}>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth label="Video Title"
                        value={newVideoData.title}
                        onChange={(e) => setNewVideoData({ ...newVideoData, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Video URL"
                        value={newVideoData.url}
                        onChange={(e) => setNewVideoData({ ...newVideoData, url: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVideo(false)}>Cancel</Button>
                    <Button onClick={handleAddVideo} variant="contained">Add Video</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseEditor;
