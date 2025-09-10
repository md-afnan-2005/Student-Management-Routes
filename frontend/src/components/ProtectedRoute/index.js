import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
        // Not logged in → redirect to login
        return <Navigate to="/login" />;
    }

    if (role && userRole !== role) {
        // Logged in but role mismatch → redirect to login
        return <Navigate to="/login" />;
    }

    // Allowed → show the component
    return children;
}

export default ProtectedRoute;
