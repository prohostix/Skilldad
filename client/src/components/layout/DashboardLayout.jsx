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
    // Only open the sidebar by default on large screens
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [referModalOpen, setReferModalOpen] = useState(false);
    const location = useLocation();

    // Detect student role
    const userInfo = (() => { try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; } })();
    const isStudent = userInfo?.role?.toLowerCase() === 'student';

    // Close sidebar on path change if we're on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Use a dark background for the dashboard
    const backgroundClass = 'bg-[#04020a]';

    return (
        <div className={`min-h-screen ${backgroundClass} flex flex-col relative`}>
            {/* Upper Section: Sidebar + Content */}
            <div className="flex flex-1 relative min-h-0">
                <ModernSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 max-w-full">
                    <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className={`${location.pathname.includes('/session/') || location.pathname.includes('/course/') ? 'p-0' : 'p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto'} w-full flex-1`}>
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
