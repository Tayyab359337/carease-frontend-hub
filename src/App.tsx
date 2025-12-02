import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import AdminDashboard from "./pages/Admin/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import PatientDashboard from "./pages/Patient/Dashboard";
import Doctors from "./pages/Admin/Doctors";
import AdminPatients from "./pages/Admin/Patients";
import Payments from "./pages/Admin/Payments";
import DoctorPatients from "./pages/Doctor/Patients";
import Appointments from "./pages/Appointments";
import Visits from "./pages/Visits";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Pricing from "./pages/Pricing";
import PatientDetails from "./pages/Details/PatientDetails";
import DoctorDetails from "./pages/Details/DoctorDetails";
import VisitDetails from "./pages/Details/VisitDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes with Role-based Access */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Doctors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              
              {/* Doctor Routes */}
              <Route
                path="/patients"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <PatientsRouter />
                  </ProtectedRoute>
                }
              />
              
              {/* Shared Routes */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visits"
                element={
                  <ProtectedRoute>
                    <Visits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscription"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <Subscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pricing"
                element={<Pricing />}
              />

              {/* Detail Pages */}
              <Route
                path="/patients/:id"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <PatientDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctors/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DoctorDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visits/:id"
                element={
                  <ProtectedRoute>
                    <VisitDetails />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Helper component to route to correct dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Helper component to route patients page based on role
const PatientsRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return user.role === 'admin' ? <AdminPatients /> : <DoctorPatients />;
};

export default App;
