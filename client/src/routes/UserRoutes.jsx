import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
const About = React.lazy(() => import("../pages/user/About"));
const MyAccount = React.lazy(() => import("../pages/user/MyAccount/MyAccount"));
const Cart = React.lazy(() => import("../pages/user/Cart"));
const Shop = React.lazy(() => import("../pages/user/Shop"));
const Checkout = React.lazy(() => import("../pages/user/Checkout/Checkout"));
const ForgotPassword = React.lazy(() => import("../pages/user/ForgotPassword"));
const Contact = React.lazy(() => import("../pages/user/Contact"));
const Home = React.lazy(() => import("../pages/user/Home"));
const Login = React.lazy(() => import("../pages/user/Login"));
const OrderDetails = React.lazy(() => import("../pages/user/OrderDetails"));
const OrderConfirmation = React.lazy(() => import("../pages/user/OrderConfirmation"));
const OtpVerification = React.lazy(() => import("../pages/user/OtpVerification"));
const ProductDetails = React.lazy(() => import("../pages/user/ProductDetails"));
const Register = React.lazy(() => import("../pages/user/Register"));
const ResetPassword = React.lazy(() => import("../pages/user/ResetPassword"));
const Wishlist = React.lazy(() => import("../pages/user/Wishlist"));
const OrderHistory = React.lazy(() => import("../pages/user/OrderHistory"));
const EmailVerification = React.lazy(() => import("../pages/user/EmailVerification"));
const VerifyEmail = React.lazy(() => import("../pages/user/VerifyEmail"));
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
