import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import Footer from "../components/admin/Footer";
import { loadAdminAssets } from "../utils/loadAdminAssets";
import { useAuth } from "../contexts/AuthContext"; // 👈 assuming you have this

const AdminLayout = () => {

    // Get auth info
    const { isLoggedIn, user } = useAuth();

    const [isSidebarToggled, setIsSidebarToggled] = useState(
        localStorage.getItem("sb|sidebar-toggle") === "true"
    );

    useEffect(() => {
        if (isSidebarToggled) {
            document.body.classList.add("sb-sidenav-toggled");
        } else {
            document.body.classList.remove("sb-sidenav-toggled");
        }
    }, [isSidebarToggled]);

    useEffect(() => {
        loadAdminAssets();
    }, []);

    // Redirect if not logged in
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Redirect if not an admin
    if (user?.role !== "Admin") {
        return <Navigate to="/" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarToggled((prev) => {
            const newState = !prev;
            localStorage.setItem("sb|sidebar-toggle", newState.toString());
            return newState;
        });
    };

    return (
        <div className="sb-nav-fixed">
            <div id="layoutSidenav">
                <Header toggleSidebar={toggleSidebar} />
                <Sidebar isSidebarToggled={isSidebarToggled} />
                <div id="layoutSidenav_content">
                    <main>
                        <div className="container-fluid px-sm-4">
                            <Outlet />
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
