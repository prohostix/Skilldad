import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import DashboardNavbar from './DashboardNavbar';
import BottomNav from '../ui/BottomNav';
import Footer from '../ui/Footer';
import FloatingHelpWidget from '../ui/FloatingHelpWidget';

const DashboardLayout = () => {
    // Only open the sidebar by default on large screens
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    // Close sidebar on path change if we're on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Use a dark background for the dashboard
    const backgroundClass = 'bg-[#04020a]';

    return (
        <div className={`min-h-screen ${backgroundClass} flex flex-col relative overflow-hidden`}>

            <div className="flex flex-1 relative overflow-visible z-10">
                <ModernSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                    <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className={`flex-1 ${location.pathname.includes('/session/') ? 'p-0 sm:p-0 lg:px-0 max-w-none' : 'p-4 sm:p-6 lg:px-8 max-w-[1600px] mx-auto'} pt-0 lg:pt-0 pb-28 w-full`}>
                        <Outlet />
                    </main>
                </div>
            </div>

            <Footer />
            <BottomNav />
            <FloatingHelpWidget />
        </div>
    );
};

export default DashboardLayout;
