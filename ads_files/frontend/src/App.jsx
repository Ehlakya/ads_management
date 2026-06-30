import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';


// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import TheatreAuth from './pages/Auth/TheatreAuth';
import Unauthorized from './pages/Auth/Unauthorized';
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AgentDashboard from './pages/Dashboard/AgentDashboard';
import TheatreDashboard from './pages/Dashboard/TheatreDashboard';
import UserList from './pages/Users/UserList';
import CreateAdmin from './pages/Users/CreateAdmin';
import CreateAgent from './pages/Users/CreateAgent';
import AdsList from './pages/Ads/AdsList';
import CreateAd from './pages/Ads/CreateAd';
import EditAd from './pages/Ads/EditAd';
import AdDetails from './pages/Ads/AdDetails';
import QuotationList from './pages/Quotations/QuotationList';
import SendQuotation from './pages/Quotations/SendQuotation';
import QuotationDetails from './pages/Quotations/QuotationDetails';
import QuotationRequestForm from './pages/Quotations/QuotationRequestForm';
import TheatreRequests from './pages/Quotations/TheatreRequests';
import TheatreResponses from './pages/Quotations/TheatreResponses';
import AdminRequests from './pages/Quotations/AdminRequests';
import SalesList from './pages/Sales/SalesList';
import AgentRequests from './pages/Sales/AgentRequests';
import AdminResponse from './pages/Sales/AdminResponse';
import AddSale from './pages/Sales/AddSale';
import UpdateSaleStatus from './pages/Sales/UpdateSaleStatus';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import { Outlet } from 'react-router-dom';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/theatre-auth" element={<TheatreAuth />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            
            {/* Users */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="users/create-admin" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <CreateAdmin />
              </ProtectedRoute>
            } />
            <Route path="users/create-agent" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <CreateAgent />
              </ProtectedRoute>
            } />
            
            {/* Ads */}
            <Route path="ads" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdsList />
              </ProtectedRoute>
            } />
            <Route path="ads/create" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <CreateAd />
              </ProtectedRoute>
            } />
            <Route path="ads/edit/:id" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <EditAd />
              </ProtectedRoute>
            } />
            <Route path="ads/:id" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'agent']}>
                <AdDetails />
              </ProtectedRoute>
            } />
            
            {/* Quotations */}
            <Route path="quotations" element={<QuotationList />} />
            <Route path="quotations/send" element={<SendQuotation />} />
            <Route path="quotations/:id" element={<QuotationDetails />} />
            <Route path="quotations/:id/request" element={
              <ProtectedRoute allowedRoles={['theatre_user']}>
                <QuotationRequestForm />
              </ProtectedRoute>
            } />
            <Route path="theatre-requests" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <TheatreRequests />
              </ProtectedRoute>
            } />
            <Route path="theatre-responses" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <TheatreResponses />
              </ProtectedRoute>
            } />
            <Route path="admin-requests" element={
              <ProtectedRoute allowedRoles={['theatre_user']}>
                <AdminRequests />
              </ProtectedRoute>
            } />
            
            {/* Sales */}
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/requests" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AgentRequests />
              </ProtectedRoute>
            } />
            <Route path="sales/responses" element={
              <ProtectedRoute allowedRoles={['agent', 'theatre_user']}>
                <AdminResponse />
              </ProtectedRoute>
            } />
            <Route path="sales/add/:adId" element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AddSale />
              </ProtectedRoute>
            } />
            <Route path="sales/update/:id" element={<UpdateSaleStatus />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="main-content">
          <Outlet />
        </main>
        {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      </div>
      <style>{`
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 40;
        }

        @media (max-width: 1024px) {
          .sidebar-overlay {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};


// Helper component to route to correct dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'superadmin') return <SuperAdminDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'agent') return <AgentDashboard />;
  if (user?.role === 'theatre_user') return <TheatreDashboard />;
  
  return <Navigate to="/login" replace />;
};

export default App;
