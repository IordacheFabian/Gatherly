import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const RequireAuth = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="pt-24 container mx-auto px-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
