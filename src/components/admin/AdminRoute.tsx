import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export function AdminRoute() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user exists and has admin role directly from context
  const isAdmin = user && user.role === 'admin';

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
