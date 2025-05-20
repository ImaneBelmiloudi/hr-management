import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import SidebarEmployee from './components/layout/sidebars/SidebarEmployee';
import SidebarAdmin from './components/layout/sidebars/SidebarAdmin';
import SidebarRH from './components/layout/sidebars/SidebarRH';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login';

// Common Pages
import Profile from './pages/common/Profile';
import Settings from './pages/common/Settings';

// Employee Pages
import DashboardEmployee from './pages/employee/Dashboard';
import LeaveRequestEmployee from './pages/employee/LeaveRequest';
import AbsenceFollowEmployee from './pages/employee/AbsenceFollow';
import ComplaintEmployee from './pages/employee/Complaint';

// Admin Pages
import DashboardAdmin from './pages/admin/Dashboard';
import ManageEmployeesAdmin from './pages/admin/ManageEmployees';
import ManageRh from './pages/admin/ManageRh';
import LeaveRequestsAdmin from './pages/admin/LeaveRequests';
import AbsenceJustificationsAdmin from './pages/admin/AbsenceJustifications';
import ComplaintReviewsAdmin from './pages/admin/ComplaintReviews';

// RH Pages
import DashboardRH from './pages/rh/Dashboard';
import ManageEmployeesRH from './pages/rh/ManageEmployees';
import LeaveRequestsRH from './pages/rh/LeaveRequests';
import AbsenceJustificationsRH from './pages/rh/AbsenceJustifications';
import ComplaintReviewsRH from './pages/rh/ComplaintReviews';

const AppContent = () => {
  const location = useLocation();
  const { user, loading, isAuthenticated, isAdmin, isHR } = useAuth();
  const { isCollapsed } = useSidebar();

  const renderSidebar = () => {
    if (isAdmin()) {
      return <SidebarAdmin />;
    } else if (isHR()) {
      return <SidebarRH />;
    }
    return <SidebarEmployee />;
  };

  // Determine whether to show layout
  const hideLayoutPaths = ['/', '/login'];
  const showLayout = !hideLayoutPaths.includes(location.pathname);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm font-medium text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!showLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-1 flex-col transition-all duration-500">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block">
        {renderSidebar()}
      </div>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col transition-all duration-500 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Navbar />
        
        <main className="flex-1 bg-gray-50 px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />

              {/* Common Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'rh', 'employee']} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Employee Routes */}
              <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                <Route path="/employee/dashboard" element={<DashboardEmployee />} />
                <Route path="/employee/leave-requests" element={<LeaveRequestEmployee />} />
                <Route path="/employee/absence-follow" element={<AbsenceFollowEmployee />} />
                <Route path="/employee/complaints" element={<ComplaintEmployee />} />
                
                {/* Legacy routes - keeping for backward compatibility */}
                <Route path="/leave-request" element={<Navigate to="/employee/leave-requests" replace />} />
                <Route path="/complaint" element={<Navigate to="/employee/complaints" replace />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/manage-rh" element={<ManageRh />} />
                <Route path="/admin/manage-employees" element={<ManageEmployeesAdmin />} />
                <Route path="/admin/leave-requests" element={<LeaveRequestsAdmin />} />
                <Route path="/admin/absence-justifications" element={<AbsenceJustificationsAdmin />} />
                <Route path="/admin/complaint-reviews" element={<ComplaintReviewsAdmin />} />
              </Route>

              {/* RH Routes */}
              <Route element={<ProtectedRoute allowedRoles={['rh']} />}>
                <Route path="/rh/dashboard" element={<DashboardRH />} />
                <Route path="/rh/manage-employees" element={<ManageEmployeesRH />} />
                <Route path="/rh/leave-requests" element={<LeaveRequestsRH />} />
                <Route path="/rh/absence-justifications" element={<AbsenceJustificationsRH />} />
                <Route path="/rh/complaint-reviews" element={<ComplaintReviewsRH />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={
                isAuthenticated() ? (
                  isAdmin() ? <Navigate to="/admin/dashboard" replace /> : 
                  isHR() ? <Navigate to="/rh/dashboard" replace /> : 
                  <Navigate to="/employee/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </AuthProvider>
  );
};

export default App;