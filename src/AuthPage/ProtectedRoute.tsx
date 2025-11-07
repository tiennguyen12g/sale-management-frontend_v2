import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../zustand/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // optional, only check if provided
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token, accessRole } = useAuthStore();

  // Check if user is authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && accessRole !== requiredRole) {
    // user is logged in but not authorized
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}