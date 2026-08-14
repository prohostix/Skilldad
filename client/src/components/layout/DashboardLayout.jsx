import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import DashboardNavbar from './DashboardNavbar';
import BottomNav from '../ui/BottomNav';
import Footer from '../ui/Footer';
import FloatingHelpWidget from '../ui/FloatingHelpWidget';
import { ReferFAB } from '../student/ReferralWidget';
import ReferralModal from '../student/ReferralModal';

const DashboardLayout = () => {
    // Sidebar collapsed by default (false) on all screens, but remember user's choice
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        // If nothing is saved, default to false (collapsed)
        return saved === 'true';
    });

    // Save to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarOpen', isSidebarOpen);
    }, [isSidebarOpen]);

    const [referModalOpen, setReferModalOpen] = useState(false);
    const location = useLocation();

    // Detect student role
    const userInfo = (() => { try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; } })();
    const isStudent = userInfo?.role?.toLowerCase() === 'student';

    // Auto-manage sidebar state for specific routes
    useEffect(() => {
        const isCourseOrSession = location.pathname.includes('/course/') || location.pathname.includes('/session/');
        
        if (isCourseOrSession || window.innerWidth < 1024) {
            // Auto-hide on mobile or immersive views
            setIsSidebarOpen(false);
        }
        // Removed the "else" that forced it open on desktop, so it stays collapsed by default
    }, [location.pathname]);

    // Support both light and dark backgrounds
    const backgroundClass = 'bg-white dark:bg-alyra-dark';

    return (
        <div className={`min-h-screen ${backgroundClass} flex flex-col relative dashboard-layout`}>
            {/* Upper Section: Sidebar + Content */}
            <div className="flex flex-1 relative min-h-0">
                <ModernSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 max-w-full">
                    <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className={`${location.pathname.includes('/session/') || location.pathname.includes('/course/') ? 'p-0' : 'px-3 sm:px-6 lg:px-8 py-3 lg:py-4 max-w-[1600px] mx-auto'} w-full flex-1`}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Bottom Section: Full Width Footer */}
            {!location.pathname.includes('/session/') && (
                <div className="z-20">
                    <Footer forceVisible={true} />
                </div>
            )}
            {!location.pathname.includes('/session/') && <BottomNav />}

            {!location.pathname.includes('/session/') && <FloatingHelpWidget />}
            {isStudent && !location.pathname.includes('/session/') && location.pathname !== '/dashboard/reward-wallet' && (
                <>
                    <ReferralModal isOpen={referModalOpen} onClose={() => setReferModalOpen(false)} />
                </>
            )}
        </div>
    );
};

export default DashboardLayout;
