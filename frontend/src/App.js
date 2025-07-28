import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Users from './pages/settings/Users';
import Layout from './components/Layout';
import CreateRequisition from './pages/Requisitions/Create';
import RequisitionHistory from './pages/Requisitions/History';
import ApprovalPage from './pages/Approvals/ApprovalPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NewDashboard from './pages/Dashboard/NewDashboard';
import MaterialsPage from './pages/materials/Materials';

function PrivateRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function RoleRoute({ allowedRoles }) {
  const { user } = React.useContext(AuthContext);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<RoleRoute allowedRoles={['admin','staff','approver']} />}>
                <Route index element={<NewDashboard />} />
              </Route>
              <Route path="/requisitions/create" element={<RoleRoute allowedRoles={['staff', 'admin']} />}>
                <Route index element={<CreateRequisition />} />
              </Route>
              <Route path="/requisitions/history" element={<RoleRoute allowedRoles={['staff']} />}>
                <Route index element={<RequisitionHistory />} />
              </Route>
              <Route path="/approvals" element={<RoleRoute allowedRoles={['approver']} />}>
                <Route index element={<ApprovalPage />} />
              </Route>
              <Route path="/reports" element={<RoleRoute allowedRoles={['admin', 'approver']} />}>
                <Route index element={<ReportsPage />} />
              </Route>
              <Route path="/settings/Users" element={<RoleRoute allowedRoles={['admin']} />}>
                <Route index element={<Users />} />
              </Route>
              <Route path="/materials/Materials" element={<RoleRoute allowedRoles={['admin']} />}>
                <Route index element={<MaterialsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;