import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Students from './pages/Students';
import Mentors from './pages/Mentors';
import SyllabusPage from './pages/Syllabus';
import Batches from './pages/Batches';
import BatchDetails from './pages/BatchDetails';
import ClassSchedulePage from './pages/ClassSchedule';
import Guests from './pages/Guests';
import Admin from './pages/Admin';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="batches" element={<Batches />} />
              <Route path="batches/:batchId" element={<BatchDetails />} />
              <Route path="students" element={<Students />} />
              <Route path="mentors" element={<Mentors />} />
              <Route path="syllabus" element={<SyllabusPage />} />
              <Route path="schedule" element={<ClassSchedulePage />} />
              <Route path="guests" element={<Guests />} />
              <Route path="admin" element={<Admin />} />
              <Route path="users" element={<Users />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
