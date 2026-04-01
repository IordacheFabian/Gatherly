import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const RedirectIfAuthenticated = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="pt-24 container mx-auto px-6">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuthenticated;
