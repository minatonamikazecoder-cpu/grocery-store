// src/components/user/RoleGuard.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RoleGuard = ({ children }) => {
  const { user } = useAuth();

  // If logged in and user is Admin, redirect them
  if (user?.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default RoleGuard;
