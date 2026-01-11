import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketView from "./TicketView";
import App from "./App";
import Login from "./Login";
import Signup from "./Signup";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { UserProtectedRoute, AdminProtectedRoute } from "./ProtectedRoute";

export default function Root() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User Protected Routes */}
        <Route
          path="/"
          element={
            <UserProtectedRoute>
              <App />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/ticket/:ticketId"
          element={
            <UserProtectedRoute>
              <TicketView />
            </UserProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
