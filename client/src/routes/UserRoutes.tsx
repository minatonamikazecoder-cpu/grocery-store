import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import About from "../pages/user/About";
import MyAccount from "../pages/user/MyAccount/MyAccount";
import Cart from "../pages/user/Cart";
import Shop from "../pages/user/Shop";
import Checkout from "../pages/user/Checkout/Checkout";
import ForgotPassword from "../pages/user/ForgotPassword";
import Contact from "../pages/user/Contact";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";
import OrderDetails from "../pages/user/OrderDetails";
import OrderConfirmation from "../pages/user/OrderConfirmation";
import OtpVerification from "../pages/user/OtpVerification";
import ProductDetails from "../pages/user/ProductDetails";
import Register from "../pages/user/Register";
import ResetPassword from "../pages/user/ResetPassword";
import Wishlist from "../pages/user/Wishlist";
import OrderHistory from "../pages/user/OrderHistory";
import EmailVerification from "../pages/user/EmailVerification";
import VerifyEmail from "../pages/user/VerifyEmail";
import ProtectedRoute from "../components/user/ProtectedRoute";
import RoleGuard from "../components/user/RoleGuard";
const UserRoutes = () => {
  return ( 
    <Routes>
        <Route path="/" element={<RoleGuard><UserLayout /></RoleGuard>}>
            <Route index element={<Home />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="verify-otp" element={<OtpVerification />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<EmailVerification />}  />

            <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="order-confirm" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />

        </Route>
  </Routes>
  );
};

export default UserRoutes;
