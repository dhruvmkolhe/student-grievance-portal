import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const ComplaintForm = lazy(() => import("./pages/ComplaintForm"));
const NotFound = lazy(() => import("./pages/NotFound"));

const STAFF_ROLES = ["hod", "proctor", "warden", "repairman", "admin"];

function ProtectedRoute({ children, role, allowStaff }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "student" ? "/dashboard" : "/staff"} replace />;
  }
  if (allowStaff && user.role === "student") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "student" ? "/dashboard" : "/staff"} replace />;
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2.5 font-mono text-xs text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-ping" />
        <span>Loading portal…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-zinc-800 transition-colors duration-150">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new"
                element={
                  <ProtectedRoute role="student">
                    <ComplaintForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowStaff>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod"
                element={
                  <ProtectedRoute allowStaff>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Custom 404 Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
