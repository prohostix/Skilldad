import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const drawerWidth = 240;

const StudentDashboardLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { text: 'My Courses', icon: <SchoolIcon />, path: '/dashboard/my-courses' },
        { text: 'Live Classes', icon: <VideoCameraFrontIcon />, path: '/dashboard/live-classes' },
        { text: 'Course Catalog', icon: <MenuBookIcon />, path: '/courses' },
    ];

    const handleLogout = () => {
        // Clear token (to be implemented)
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Skill Dad - Student Panel
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

export default StudentDashboardLayout;
