import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    // Standard users trying to access admin routes get redirected to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
