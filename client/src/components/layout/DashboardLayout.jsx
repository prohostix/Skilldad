import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import DashboardNavbar from './DashboardNavbar';
import BottomNav from '../ui/BottomNav';

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

    // The sidebar is position:fixed (see ModernSidebar) so it never scrolls away
    // or goes blank mid-scroll - a real bug the previous position:sticky approach
    // had. Since fixed removes it from normal flex flow, the content column here
    // needs a matching left offset (desktop only - on mobile the sidebar overlays
    // as a drawer and content should not shift), mirroring ModernSidebar's own
    // width calculation exactly (76px collapsed, 208px for students / 240px
    // otherwise when open).
    // Threshold is xl (1280px) to match ModernSidebar's own isDesktop threshold -
    // see the comment there for why: page content grids use viewport-relative
    // lg:/xl: breakpoints, so the sidebar must not start eating viewport width
    // until content's own breakpoints assume a wide-enough desktop viewport too.
    const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1280 : true));
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1280);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const sidebarWidthPx = isSidebarOpen ? (isStudent ? 208 : 240) : 76;
    const contentOffsetPx = isDesktop ? sidebarWidthPx : 0;

    // Auto-manage sidebar state for specific routes
    useEffect(() => {
        const isCourseOrSession = location.pathname.includes('/course/') || location.pathname.includes('/session/');
        
        if (isCourseOrSession || window.innerWidth < 1280) {
            // Auto-hide on mobile or immersive views
            setIsSidebarOpen(false);
        }
        // Removed the "else" that forced it open on desktop, so it stays collapsed by default
    }, [location.pathname]);

    // Support both light and dark backgrounds
    const backgroundClass = 'bg-white dark:bg-alyra-dark';

    return (
        <div className={`min-h-screen ${backgroundClass} flex flex-col relative dashboard-layout w-full max-w-full overflow-x-hidden`}>
            {/* Upper Section: Sidebar + Content */}
            <div className="flex flex-1 relative min-h-0 w-full max-w-full overflow-x-hidden">
                <ModernSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Content Area - offset by marginLeft to match the fixed sidebar's current width */}
                <div
                    className="flex-1 flex flex-col min-w-0 transition-[margin] duration-300 max-w-full w-full overflow-x-hidden"
                    style={{ marginLeft: contentOffsetPx }}
                >
                    <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className={`${location.pathname.includes('/session/') || location.pathname.includes('/course/') ? 'p-0' : 'px-3 sm:px-6 lg:px-8 pt-1.5 pb-28 lg:pt-2 lg:pb-4 max-w-[1600px] mx-auto'} w-full flex-1 min-w-0 overflow-x-hidden max-w-full`}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Bottom Section: Full Width Footer Removed as requested */}
            {!location.pathname.includes('/session/') && <BottomNav />}

            {!location.pathname.includes('/session/') && !location.pathname.includes('/course/') && !location.pathname.includes('/exam/') && <FloatingHelpWidget />}
            {isStudent && !location.pathname.includes('/session/') && location.pathname !== '/dashboard/reward-wallet' && (
                <>
                    <ReferralModal isOpen={referModalOpen} onClose={() => setReferModalOpen(false)} />
                </>
            )}
        </div>
    );
};

export default DashboardLayout;
