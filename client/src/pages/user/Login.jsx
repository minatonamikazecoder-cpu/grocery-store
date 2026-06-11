import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure login method from useAuth

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
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

    if (res.data.user.role === "admin") {
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
        <div className="container">
            <div className="row p-3 g-3 mt-4 justify-content-center h-100 align-items-center">
                <div className="col-md-6">
                    <div className="login-form d-flex flex-column justify-content-center h-100 align-items-center">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Log in to PureBite</h2>
                            <div className="mb-4 font-black">Enter your details below</div>
                            <form id="loginForm" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="w-100 p-2"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <p className="error mb-4">{errors.email}</p>

                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="w-100 p-2"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <p className="error mb-4">{errors.password}</p>

                                <div className="d-flex w-100 align-items-center">
                                    <button type="submit" className="btn-msg" disabled={loading}>
                                        {loading ? "Logging in..." : "Log in"}
                                    </button>
                                    <div className="highlight justify-self-end ms-auto">
                                        <Link to="/forgot-password" className="text-decoration-none link highlight">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {loading && (
                                    <div className="text-center mt-3">
                                        <span className="spinner-border text-primary" role="status"></span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
