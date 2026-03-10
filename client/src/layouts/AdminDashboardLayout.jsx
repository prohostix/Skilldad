import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const AdminDashboardLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Courses', icon: <ClassIcon />, path: '/admin/courses' },
        { text: 'B2B & Partners', icon: <BusinessIcon />, path: '/admin/b2b' },
        { text: 'Analytics', icon: <AssessmentIcon />, path: '/admin/analytics' },
        { text: 'Schedule Class', icon: <VideoCameraFrontIcon />, path: '/admin/schedule' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#111827' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Skill Dad - Admin Panel
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
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminDashboardLayout;
