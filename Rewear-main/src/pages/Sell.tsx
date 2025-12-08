import { SellForm } from "@/components/sell-form";
import { useAuth } from "@/context/auth-context";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Sell() {
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
    <>
      <SellForm />
    </>
  );
}
