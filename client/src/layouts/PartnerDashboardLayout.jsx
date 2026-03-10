import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const PartnerDashboardLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/partner/dashboard' },
        { text: 'My Discounts', icon: <LocalOfferIcon />, path: '/partner/discounts' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#059669' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Skill Dad - B2B Partner
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
                        <Typography variant="h4" color="error" gutterBottom>Account Pending Verification</Typography>
                        <Typography variant="body1">Your B2B Partner account is awaiting administrative approval. You will have access to the dashboard once verified.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PartnerDashboardLayout;
