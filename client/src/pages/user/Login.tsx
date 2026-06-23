import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAuth(); // Destructure login method from useAuth

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;
        if (!value.trim()) {
            error = name === "email" ? "Email is required" : "Password is required";
        } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Enter a valid email address";
        } else if (name === "password" && value.length < 6) {
            error = "Password must be at least 6 characters long";
        }
        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.values(formErrors).some(error => error)) {
            setErrors(formErrors);
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/users/login", formData);

            toast.success("Login successful!");
            login(res.data.token, res.data.user);

            if (res.data.user.role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            // 🛑 Extract meaningful error message from response
            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Login failed. Please try again.";

            toast.error(backendMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2>Log in to PureBite</h2>
                    <p className="subtext">Enter your details below to access your account</p>
                    <form id="loginForm" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                id="email"
                                name="email"
                                className="w-100 p-2"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.email && <p className="error mt-1 mb-0">{errors.email}</p>}
                        </div>

                        <div className="mb-3">
                            <div className="password-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="w-100 p-2"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                            {errors.password && <p className="error mt-1 mb-0">{errors.password}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                        
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div style={{ fontSize: "0.9rem" }}>
                                Don't have an account? <Link to="/register" className="dim link ms-1 font-weight-bold">Register</Link>
                            </div>
                            <Link to="/forgot-password" style={{ fontSize: "0.9rem" }} className="text-decoration-none link highlight font-weight-bold">
                                Forgot password?
                            </Link>
                        </div>

                        {loading && (
                            <div className="text-center mt-3">
                                <span className="spinner-border text-primary" role="status"></span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <div className="auth-brand-panel">
                <div className="auth-brand-content">
                    <h3>Freshness Delivered</h3>
                    <p>Experience the easiest way to shop for premium organic groceries, sourced directly from local growers.</p>
                    <div className="social-proof mt-4">
                        <div className="social-proof-avatars">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="User" />
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="User" />
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" alt="User" />
                        </div>
                        <div className="social-proof-text">
                            Join 10,000+ happy customers
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
