import React, { Suspense } from "react";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import { BrowserRouter } from "react-router-dom";
import './App.css';
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return <BrowserRouter>
    <AuthProvider>
      <Suspense fallback={<div className="loading-overlay">Loading...</div>}>
        <AdminRoutes />
        <UserRoutes />
      </Suspense>
    </AuthProvider>
  </BrowserRouter>;
}

export default App
