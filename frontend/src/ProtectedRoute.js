import { Navigate } from "react-router-dom";

// Protected route for regular users
export function UserProtectedRoute({ children }) {
  const token = localStorage.getItem("userToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected route for admin users
export function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
