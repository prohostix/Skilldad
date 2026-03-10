import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, AppBar, IconButton, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, Payments as PaymentsIcon, ExitToApp as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const FinanceDashboardLayout = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/finance/dashboard' },
        { text: 'Payout Requests', icon: <PaymentsIcon />, path: '/finance/payouts' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1e293b' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                        Skill Dad <span style={{ color: '#fbbf24', marginLeft: '5px' }}>Finance</span>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>{userInfo?.name}</Typography>
                        <IconButton color="inherit" onClick={handleLogout} size="small">
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem button key={item.text} component={Link} to={item.path} sx={{
                                mb: 1,
                                mx: 1,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: '#f1f5f9' }
                            }}>
                                <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <List>
                        <ListItem button onClick={handleLogout} sx={{ mx: 1, borderRadius: '8px', color: 'error.main' }}>
                            <ListItemIcon sx={{ minWidth: '40px', color: 'error.main' }}><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem' }} />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc', minHeight: '100vh', mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default FinanceDashboardLayout;
