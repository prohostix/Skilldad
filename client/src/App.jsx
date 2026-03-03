import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

// Layouts
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
import ScrollToTop from './components/ScrollToTop';

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const Platform = lazy(() => import('./pages/Platform'));
const TestCourses = lazy(() => import('./pages/TestCourses'));
const Services = lazy(() => import('./pages/Services'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Support = lazy(() => import('./pages/Support'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Partners = lazy(() => import('./pages/Partners'));
const Settings = lazy(() => import('./pages/Settings'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const HostRoom = lazy(() => import('./pages/HostRoom'));
const StudentRoom = lazy(() => import('./pages/StudentRoom'));
const NotificationDemo = lazy(() => import('./pages/NotificationDemo'));
const LinkZoomRecording = lazy(() => import('./pages/university/LinkZoomRecording'));
const MockPaymentGateway = lazy(() => import('./pages/MockPaymentGateway'));
import { PrivacyPolicy, TermsOfService, CookiePolicy, RefundPolicy } from './pages/LegalPages';
const UniversityPublicDetail = lazy(() => import('./pages/UniversityPublicDetail'));



// Student Pages
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const CoursePlayer = lazy(() => import('./pages/student/CoursePlayer'));
const LiveClasses = lazy(() => import('./pages/student/LiveClasses'));
const ProjectView = lazy(() => import('./pages/student/ProjectView'));
const Documents = lazy(() => import('./pages/student/Documents'));
const Exams = lazy(() => import('./pages/student/Exams'));
const CourseEnrollment = lazy(() => import('./pages/student/CourseEnrollment'));
const WatchStream = lazy(() => import('./pages/student/WatchStream'));
const PaymentInitiation = lazy(() => import('./pages/student/PaymentInitiation'));
const PaymentCallback = lazy(() => import('./pages/student/PaymentCallback'));
const PaymentHistory = lazy(() => import('./pages/student/PaymentHistory'));
const PaymentStatus = lazy(() => import('./pages/student/PaymentStatus'));
const InteractiveContentPage = lazy(() => import('./pages/student/InteractiveContentPage'));

// University Pages
const UniversityDashboard = lazy(() => import('./pages/university/UniversityDashboard'));
const GroupManagement = lazy(() => import('./pages/university/GroupManagement'));
const LiveSessionsHub = lazy(() => import('./pages/university/LiveSessionsHub'));
const SessionDetail = lazy(() => import('./pages/university/SessionDetail'));
const ScheduleClass = lazy(() => import('./pages/university/ScheduleClass'));
const ExamManagement = lazy(() => import('./pages/university/ExamManagement'));
const CourseContentManagement = lazy(() => import('./pages/university/CourseContentManagement'));

// Partner Pages
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'));
const CommissionWallet = lazy(() => import('./pages/partner/CommissionWallet'));
const PartnerStudentManagement = lazy(() => import('./pages/partner/PartnerStudentManagement'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CourseManager = lazy(() => import('./pages/admin/CourseManager'));
const CourseEditor = lazy(() => import('./pages/admin/CourseEditor'));
const UserList = lazy(() => import('./pages/admin/UserList'));
const StudentManagement = lazy(() => import('./pages/admin/StudentManagement'));
const UniversityManagement = lazy(() => import('./pages/admin/UniversityManagement'));
const B2BManagement = lazy(() => import('./pages/admin/B2BManagement'));
const PartnerDetail = lazy(() => import('./pages/admin/PartnerDetail'));
const PlatformAnalytics = lazy(() => import('./pages/admin/PlatformAnalytics'));
const ProjectManager = lazy(() => import('./pages/admin/ProjectManager'));
const ExamScheduler = lazy(() => import('./pages/admin/ExamScheduler'));
const PayoutManager = lazy(() => import('./pages/admin/PayoutManager'));
const SupportManagement = lazy(() => import('./pages/admin/SupportManagement'));
const PartnerLogoManager = lazy(() => import('./pages/admin/PartnerLogoManager'));
const AdminRefundPanel = lazy(() => import('./pages/admin/AdminRefundPanel'));
const GatewayConfigPanel = lazy(() => import('./pages/admin/GatewayConfigPanel'));
const ReconciliationDashboard = lazy(() => import('./pages/admin/ReconciliationDashboard'));
const PaymentMonitoringDashboard = lazy(() => import('./pages/admin/PaymentMonitoringDashboard'));
const CommunicationHub = lazy(() => import('./pages/admin/CommunicationHub'));
const CouponManager = lazy(() => import('./pages/admin/CouponManager'));
const UniversityDetail = lazy(() => import('./pages/admin/UniversityDetail'));

// Finance Pages
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <SocketProvider>
          <Toaster />
          <Router>
            <ScrollToTop />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* ... routes ... */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/platform" element={<Platform />} />
                <Route path="/test-courses" element={<TestCourses />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/host-room/:id" element={<HostRoom />} />
                <Route path="/student-room/:id" element={<StudentRoom />} />
                <Route path="/demo-notification" element={<NotificationDemo />} />
                <Route path="/mock-gateway/*" element={<MockPaymentGateway />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/university-profile/:name" element={<UniversityPublicDetail />} />

                {/* Protected Dashboard Routes */}

                <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="live-classes" element={<LiveClasses />} />
                    <Route path="session/:sessionId" element={<SessionDetail />} />
                    <Route path="watch/:id" element={<WatchStream />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="exams" element={<Exams />} />
                    <Route path="course/:courseId" element={<CoursePlayer />} />
                    <Route path="courses/:courseId/content/:contentId" element={<InteractiveContentPage />} />
                    <Route path="course/:courseId/projects" element={<ProjectView />} />
                    <Route path="course/:courseId/enroll" element={<CourseEnrollment />} />
                    <Route path="payment/:courseId" element={<PaymentInitiation />} />
                    <Route path="payment-callback" element={<PaymentCallback />} />
                    <Route path="payment-history" element={<PaymentHistory />} />
                    <Route path="payment-status/:transactionId" element={<PaymentStatus />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* University Routes */}
                <Route element={<ProtectedRoute allowedRoles={['university', 'admin']} />}>
                  <Route path="/university" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<UniversityDashboard />} />
                    <Route path="courses/:courseId" element={<CourseContentManagement />} />
                    <Route path="groups" element={<GroupManagement />} />
                    <Route path="live-sessions" element={<LiveSessionsHub />} />
                    <Route path="session/:sessionId" element={<SessionDetail />} />
                    <Route path="schedule" element={<ScheduleClass />} />
                    <Route path="exams" element={<ExamManagement />} />
                    <Route path="analytics" element={<UniversityDashboard />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Partner Routes */}
                <Route element={<ProtectedRoute allowedRoles={['partner', 'admin']} />}>
                  <Route path="/partner" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<PartnerDashboard />} />
                    <Route path="students" element={<PartnerStudentManagement />} />
                    <Route path="commission" element={<CommissionWallet />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="courses" element={<CourseManager />} />
                    <Route path="courses/edit/:id" element={<CourseEditor />} />
                    <Route path="courses/:courseId/modules/:moduleIndex/videos/:videoIndex/link-zoom" element={<LinkZoomRecording />} />
                    <Route path="projects" element={<ProjectManager />} />
                    <Route path="exams" element={<ExamScheduler />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="university" element={<UniversityManagement />} />
                    <Route path="university/:id" element={<UniversityDetail />} />
                    <Route path="b2b" element={<B2BManagement />} />
                    <Route path="b2b/:partnerId" element={<PartnerDetail />} />
                    <Route path="analytics" element={<PlatformAnalytics />} />
                    <Route path="coupons" element={<CouponManager />} />
                    <Route path="payouts" element={<PayoutManager />} />
                    <Route path="partner-logos" element={<PartnerLogoManager />} />
                    <Route path="refunds" element={<AdminRefundPanel />} />
                    <Route path="gateway-config" element={<GatewayConfigPanel />} />
                    <Route path="reconciliation" element={<ReconciliationDashboard />} />
                    <Route path="monitoring" element={<PaymentMonitoringDashboard />} />
                    <Route path="communications" element={<CommunicationHub />} />
                    <Route path="support" element={<SupportManagement />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Finance Routes */}
                <Route element={<ProtectedRoute allowedRoles={['finance', 'admin']} />}>
                  <Route path="/finance" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<FinanceDashboard />} />
                    <Route path="payouts" element={<FinanceDashboard />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
