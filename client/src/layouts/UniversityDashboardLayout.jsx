import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const UniversityDashboardLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/university/dashboard' },
        { text: 'Manage Groups', icon: <GroupIcon />, path: '/university/groups' },
        { text: 'Schedule Class', icon: <VideoCameraFrontIcon />, path: '/university/schedule' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1e40af' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Skill Dad - University Partner
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton onClick={() => navigate(item.path)}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <List sx={{ marginTop: 'auto' }}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', mt: 8 }}>
                {JSON.parse(localStorage.getItem('userInfo'))?.isVerified ? (
                    <Outlet />
                ) : (
                    <Box sx={{ textAlign: 'center', mt: 10 }}>
                        <Typography variant="h4" color="error" gutterBottom>Institution Pending Verification</Typography>
                        <Typography variant="body1">Your University account is awaiting administrative approval. Please contact the platform admin if this is unexpected.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default UniversityDashboardLayout;
