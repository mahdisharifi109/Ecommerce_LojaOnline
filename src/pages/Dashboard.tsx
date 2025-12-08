import { CockpitDashboard } from "@/components/cockpit-dashboard";
import { useAuth } from "@/context/auth-context";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return (
    <div className="container px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <CockpitDashboard />
    </div>
  );
}
