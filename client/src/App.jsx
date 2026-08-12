import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import lazyRetry from './utils/lazyRetry';
import './utils/axiosConfig'; // Setup axios interceptors for 401 handling

// Layouts
const DashboardLayout = lazy(() => lazyRetry(() => import('./components/layout/DashboardLayout')));
const ProtectedRoute = lazy(() => lazyRetry(() => import('./components/ProtectedRoute')));
import ScrollToTop from './components/ScrollToTop';

// Public Pages
const LandingPage = lazy(() => lazyRetry(() => import('./pages/LandingPage')));
const CourseCatalog = lazy(() => lazyRetry(() => import('./pages/CourseCatalog')));
const Platform = lazy(() => lazyRetry(() => import('./pages/Platform')));
const TestCourses = lazy(() => lazyRetry(() => import('./pages/TestCourses')));
const Services = lazy(() => lazyRetry(() => import('./pages/Services')));
const Login = lazy(() => lazyRetry(() => import('./pages/Login')));
const Register = lazy(() => lazyRetry(() => import('./pages/Register')));
const ForgotPassword = lazy(() => lazyRetry(() => import('./pages/ForgotPassword')));
const ResetPassword = lazy(() => lazyRetry(() => import('./pages/ResetPassword')));
const Support = lazy(() => lazyRetry(() => import('./pages/Support')));
const AboutUs = lazy(() => lazyRetry(() => import('./pages/AboutUs')));
const Partners = lazy(() => lazyRetry(() => import('./pages/Partners')));
const StudyAbroad = lazy(() => lazyRetry(() => import('./pages/StudyAbroad')));
const WBLPage = lazy(() => lazyRetry(() => import('./pages/public/WBLPage')));
const Settings = lazy(() => lazyRetry(() => import('./pages/Settings')));
const CourseDetail = lazy(() => lazyRetry(() => import('./pages/CourseDetail')));
const HostRoom = lazy(() => lazyRetry(() => import('./pages/HostRoom')));
const StudentRoom = lazy(() => lazyRetry(() => import('./pages/StudentRoom')));
const NotificationDemo = lazy(() => lazyRetry(() => import('./pages/NotificationDemo')));
const LinkRecording = lazy(() => lazyRetry(() => import('./pages/university/LinkRecording')));
const MockPaymentGateway = lazy(() => lazyRetry(() => import('./pages/MockPaymentGateway')));
import { PrivacyPolicy, TermsOfService, CookiePolicy, RefundPolicy } from './pages/LegalPages';
const UniversityPublicDetail = lazy(() => lazyRetry(() => import('./pages/UniversityPublicDetail')));



// Student Pages
const MyCourses = lazy(() => lazyRetry(() => import('./pages/student/MyCourses')));
const StudentDashboard = lazy(() => lazyRetry(() => import('./pages/student/StudentDashboard')));
const CoursePlayer = lazy(() => lazyRetry(() => import('./pages/student/CoursePlayer')));
const LiveClasses = lazy(() => lazyRetry(() => import('./pages/student/LiveClasses')));
const ProjectView = lazy(() => lazyRetry(() => import('./pages/student/ProjectView')));
const Documents = lazy(() => lazyRetry(() => import('./pages/student/Documents')));
const Exams = lazy(() => lazyRetry(() => import('./pages/student/Exams')));
const ExamTaker = lazy(() => lazyRetry(() => import('./components/ExamTaker')));
const ExamSubmitted = lazy(() => lazyRetry(() => import('./pages/student/ExamSubmitted')));
const ExamResult = lazy(() => lazyRetry(() => import('./pages/student/ExamResult')));
const CourseEnrollment = lazy(() => lazyRetry(() => import('./pages/student/CourseEnrollment')));
const WatchStream = lazy(() => lazyRetry(() => import('./pages/student/WatchStream')));
const PaymentInitiation = lazy(() => lazyRetry(() => import('./pages/student/PaymentInitiation')));
const PaymentCallback = lazy(() => lazyRetry(() => import('./pages/student/PaymentCallback')));
const PaymentHistory = lazy(() => lazyRetry(() => import('./pages/student/PaymentHistory')));
const PaymentStatus = lazy(() => lazyRetry(() => import('./pages/student/PaymentStatus')));
const InteractiveContentPage = lazy(() => lazyRetry(() => import('./pages/student/InteractiveContentPage')));
const PlacementsPortal = lazy(() => lazyRetry(() => import('./pages/student/PlacementsPortal')));
const VacancyDetails = lazy(() => lazyRetry(() => import('./pages/student/VacancyDetails')));
const RewardWallet = lazy(() => lazyRetry(() => import('./pages/student/RewardWallet')));

// University Pages
const UniversityDashboard = lazy(() => lazyRetry(() => import('./pages/university/UniversityDashboard')));
const GroupManagement = lazy(() => lazyRetry(() => import('./pages/university/GroupManagement')));
const LiveSessionsHub = lazy(() => lazyRetry(() => import('./pages/university/LiveSessionsHub')));
const SessionDetail = lazy(() => lazyRetry(() => import('./pages/university/SessionDetail')));
const ScheduleClass = lazy(() => lazyRetry(() => import('./pages/university/ScheduleClass')));
const ExamManagement = lazy(() => lazyRetry(() => import('./pages/university/ExamManagement')));
const ExamQuestionManager = lazy(() => lazyRetry(() => import('./pages/university/ExamQuestionManager')));
const CourseContentManagement = lazy(() => lazyRetry(() => import('./pages/university/CourseContentManagement')));
const GradingQueue = lazy(() => lazyRetry(() => import('./pages/university/GradingQueue')));
const CreateInteractiveContent = lazy(() => lazyRetry(() => import('./pages/university/CreateInteractiveContent')));
const ManageInteractiveContent = lazy(() => lazyRetry(() => import('./pages/university/ManageInteractiveContent')));
const EditInteractiveContent = lazy(() => lazyRetry(() => import('./pages/university/EditInteractiveContent')));

// Partner Pages
const PartnerDashboard = lazy(() => lazyRetry(() => import('./pages/partner/PartnerDashboard')));
const CommissionWallet = lazy(() => lazyRetry(() => import('./pages/partner/CommissionWallet')));
const PartnerStudentManagement = lazy(() => lazyRetry(() => import('./pages/partner/PartnerStudentManagement')));
const PartnerCourseManager = lazy(() => lazyRetry(() => import('./pages/partner/PartnerCourseManager')));
const PartnerCourseEditor = lazy(() => lazyRetry(() => import('./pages/partner/PartnerCourseEditor')));
const PartnerExamManagement = lazy(() => lazyRetry(() => import('./pages/partner/PartnerExamManagement')));
const PartnerExamQuestionManager = lazy(() => lazyRetry(() => import('./pages/partner/PartnerExamQuestionManager')));

// Admin Pages
const AdminDashboard = lazy(() => lazyRetry(() => import('./pages/admin/AdminDashboard')));
const CourseManager = lazy(() => lazyRetry(() => import('./pages/admin/CourseManager')));
const CourseEnquiries = lazy(() => lazyRetry(() => import('./pages/admin/CourseEnquiries')));
const CourseEditor = lazy(() => lazyRetry(() => import('./pages/admin/CourseEditor')));
const UserList = lazy(() => lazyRetry(() => import('./pages/admin/UserList')));
const StudentManagement = lazy(() => lazyRetry(() => import('./pages/admin/StudentManagement')));
const UniversityManagement = lazy(() => lazyRetry(() => import('./pages/admin/UniversityManagement')));
const SkillDadUniversities = lazy(() => lazyRetry(() => import('./pages/admin/SkillDadUniversities')));
const SkillDadUniversityDetail = lazy(() => lazyRetry(() => import('./pages/admin/SkillDadUniversityDetail')));
const B2BManagement = lazy(() => lazyRetry(() => import('./pages/admin/B2BManagement')));
const PartnerDetail = lazy(() => lazyRetry(() => import('./pages/admin/PartnerDetail')));
const PlatformAnalytics = lazy(() => lazyRetry(() => import('./pages/admin/PlatformAnalytics')));
const ProjectManager = lazy(() => lazyRetry(() => import('./pages/admin/ProjectManager')));
const ExamScheduler = lazy(() => lazyRetry(() => import('./pages/admin/ExamScheduler')));
const PayoutManager = lazy(() => lazyRetry(() => import('./pages/admin/PayoutManager')));
const SupportManagement = lazy(() => lazyRetry(() => import('./pages/admin/SupportManagement')));
const FAQManagement = lazy(() => lazyRetry(() => import('./pages/admin/FAQManagement')));
const SiteContentManager = lazy(() => lazyRetry(() => import('./pages/admin/SiteContentManager')));
const AdminRefundPanel = lazy(() => lazyRetry(() => import('./pages/admin/AdminRefundPanel')));
const GatewayConfigPanel = lazy(() => lazyRetry(() => import('./pages/admin/GatewayConfigPanel')));
const ReconciliationDashboard = lazy(() => lazyRetry(() => import('./pages/admin/ReconciliationDashboard')));
const PaymentMonitoringDashboard = lazy(() => lazyRetry(() => import('./pages/admin/PaymentMonitoringDashboard')));
const CommunicationHub = lazy(() => lazyRetry(() => import('./pages/admin/CommunicationHub')));
const CouponManager = lazy(() => lazyRetry(() => import('./pages/admin/CouponManager')));
const UniversityDetail = lazy(() => lazyRetry(() => import('./pages/admin/UniversityDetail')));
const ServicesManagement = lazy(() => lazyRetry(() => import('./pages/admin/ServicesManagement')));
const StudyAbroadManagement = lazy(() => lazyRetry(() => import('./pages/admin/StudyAbroadManagement')));

const CareerManager = lazy(() => lazyRetry(() => import('./pages/admin/CareerManager')));
const CertificateManagement = lazy(() => lazyRetry(() => import('./pages/admin/CertificateManagement')));
const DocumentReview = lazy(() => lazyRetry(() => import('./pages/admin/DocumentReview')));
const UniversityDocumentReview = lazy(() => lazyRetry(() => import('./pages/university/UniversityDocumentReview')));


// Finance Pages
const FinanceDashboard = lazy(() => lazyRetry(() => import('./pages/finance/FinanceDashboard')));

// Sales Pages
const SalesDashboard = lazy(() => lazyRetry(() => import('./pages/sales/SalesDashboard')));
const StudentApply = lazy(() => lazyRetry(() => import('./pages/sales/StudentApply')));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
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
                <Route path="/study-abroad" element={<StudyAbroad />} />
                <Route path="/wbl" element={<WBLPage />} />
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
                <Route path="/apply/:id" element={<StudentApply />} />

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
                    <Route path="placements" element={<PlacementsPortal />} />
                    <Route path="placements/:id" element={<VacancyDetails />} />
                    <Route path="reward-wallet" element={<RewardWallet />} />
                    <Route path="exam/:examId/take" element={<ExamTaker />} />
                    <Route path="exam/:examId/submitted" element={<ExamSubmitted />} />
                    <Route path="exam/:examId/result" element={<ExamResult />} />
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
                    <Route path="courses" element={<UniversityDashboard />} />
                    <Route path="courses/:courseId" element={<CourseContentManagement />} />
                    <Route path="courses/:courseId/grading" element={<GradingQueue />} />
                    <Route path="courses/:courseId/modules/:moduleId/content/create" element={<CreateInteractiveContent />} />
                    <Route path="courses/:courseId/modules/:moduleId/content/manage" element={<ManageInteractiveContent />} />
                    <Route path="courses/:courseId/modules/:moduleId/content/:contentId/edit" element={<EditInteractiveContent />} />
                    <Route path="groups" element={<GroupManagement />} />
                    <Route path="live-sessions" element={<LiveSessionsHub />} />
                    <Route path="session/:sessionId" element={<SessionDetail />} />
                    <Route path="schedule" element={<ScheduleClass />} />
                    <Route path="exams" element={<ExamManagement />} />
                    <Route path="exams/:examId/questions" element={<ExamQuestionManager />} />
                    <Route path="certificates" element={<UniversityDashboard />} />
                    <Route path="student-documents" element={<UniversityDocumentReview />} />
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
                    <Route path="courses" element={<PartnerCourseManager />} />
                    <Route path="courses/:id" element={<PartnerCourseEditor />} />
                    <Route path="live-sessions" element={<LiveSessionsHub />} />
                    <Route path="session/:sessionId" element={<SessionDetail />} />
                    <Route path="schedule" element={<ScheduleClass />} />
                    <Route path="commission" element={<CommissionWallet />} />
                    <Route path="exams" element={<PartnerExamManagement />} />
                    <Route path="exams/:examId/questions" element={<PartnerExamQuestionManager />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="courses" element={<CourseManager />} />
                    <Route path="course-enquiries" element={<CourseEnquiries />} />
                    <Route path="courses/edit/:id" element={<CourseEditor />} />
                    <Route path="courses/:courseId/modules/:moduleIndex/videos/:videoIndex/link-recording" element={<LinkRecording />} />
                    <Route path="projects" element={<ProjectManager />} />
                    <Route path="exams" element={<ExamScheduler />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="career-manager" element={<CareerManager />} />
                    <Route path="wbl" element={<CourseManager wblOnly={true} />} />
                    <Route path="university" element={<UniversityManagement />} />
                    <Route path="university/:id" element={<UniversityDetail />} />
                    <Route path="skilldad-universities" element={<SkillDadUniversities />} />
                    <Route path="skilldad-universities/:id" element={<SkillDadUniversityDetail />} />
                    <Route path="b2b" element={<B2BManagement />} />
                    <Route path="b2b/:partnerId" element={<PartnerDetail />} />
                    <Route path="analytics" element={<PlatformAnalytics />} />
                    <Route path="coupons" element={<CouponManager />} />
                    <Route path="payouts" element={<PayoutManager />} />
                    <Route path="partner-logos" element={<SiteContentManager />} />
                    <Route path="refunds" element={<AdminRefundPanel />} />
                    <Route path="gateway-config" element={<GatewayConfigPanel />} />
                    <Route path="reconciliation" element={<ReconciliationDashboard />} />
                    <Route path="monitoring" element={<PaymentMonitoringDashboard />} />
                    <Route path="communications" element={<CommunicationHub />} />
                    <Route path="support" element={<SupportManagement />} />
                    <Route path="faqs" element={<FAQManagement />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="study-abroad" element={<StudyAbroadManagement />} />

                    <Route path="certificates" element={<CertificateManagement />} />
                    <Route path="document-review" element={<DocumentReview />} />
                    <Route path="settings" element={<Settings />} />

                  </Route>
                </Route>

                {/* Finance Routes */}
                <Route element={<ProtectedRoute allowedRoles={['finance', 'admin']} />}>
                  <Route path="/finance" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<FinanceDashboard />} />
                    <Route path="payouts" element={<FinanceDashboard />} />
                    <Route path="reports" element={<FinanceDashboard />} />
                    <Route path="support" element={<Support />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Sales Routes */}
                <Route element={<ProtectedRoute allowedRoles={['sales', 'admin']} />}>
                  <Route path="/sales" element={<DashboardLayout />}>
                    <Route index element={<SalesDashboard />} />
                    <Route path="dashboard" element={<SalesDashboard />} />
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
    </ErrorBoundary>
  );
}

export default App;
