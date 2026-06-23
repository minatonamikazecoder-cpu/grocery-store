import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name: string, value: string) => {
        let error: string | null = null;
        if (!value.trim()) {
            error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')} is required`;
        } else if (name === "firstName" && (value.length < 3 || value.length > 50)) {
            error = "First Name must be between 3 and 50 characters";
        } else if (name === "lastName" && (value.length < 3 || value.length > 50)) {
            error = "Last Name must be between 3 and 50 characters";
        } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Enter a valid email address";
        } else if (name === "phone" && !/^\d{10}$/.test(value)) {
            error = "Enter a valid 10-digit phone number";
        } else if (name === "password" && value.length < 6) {
            error = "Password must be at least 6 characters long";
        } else if (name === "confirmPassword" && value !== formData.password) {
            error = "Passwords do not match";
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

        setErrors({});
        
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobile: formData.phone,
                password: formData.password,
                authType: "Email"
            };

            const response = await api.post("/users/register", payload);

            toast.success(response.data.message || "Account created successfully!");
        } catch (error) {
            const errorMessage = error || "Registration failed. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-panel">
                <div className="auth-card">
                    <h2>Create an account</h2>
                    <p className="subtext">Enter your details below to set up your account</p>
                    <form className="login-form mt-3" id="registrationForm" onSubmit={handleSubmit}>
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    className="w-100 p-2" 
                                    placeholder="First Name" 
                                    value={formData.firstName} 
                                    onChange={handleChange} 
                                />
                                {errors.firstName && <p className="error mt-1 mb-0">{errors.firstName}</p>}
                            </div>
                            <div className="col-6">
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    className="w-100 p-2" 
                                    placeholder="Last Name" 
                                    value={formData.lastName} 
                                    onChange={handleChange} 
                                />
                                {errors.lastName && <p className="error mt-1 mb-0">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="mb-3">
                            <input 
                                type="text" 
                                name="email" 
                                className="w-100 p-2" 
                                placeholder="Email address" 
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                            {errors.email && <p className="error mt-1 mb-0">{errors.email}</p>}
                        </div>

                        <div className="mb-3">
                            <input 
                                type="text" 
                                name="phone" 
                                className="w-100 p-2" 
                                placeholder="Mobile number (10-digits)" 
                                value={formData.phone} 
                                onChange={handleChange} 
                            />
                            {errors.phone && <p className="error mt-1 mb-0">{errors.phone}</p>}
                        </div>

                        <div className="mb-3">
                            <div className="password-container">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    className="w-100 p-2" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
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

                        <div className="mb-3">
                            <div className="password-container">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmPassword" 
                                    className="w-100 p-2" 
                                    placeholder="Confirm Password" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="error mt-1 mb-0">{errors.confirmPassword}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
                            Create account
                        </button>
                        
                        <div className="mt-4 text-center" style={{ fontSize: "0.9rem" }}>
                            Already have an account? <Link to="/login" className="dim link ms-1 font-weight-bold">Log in</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className="auth-brand-panel">
                <div className="auth-brand-content">
                    <h3>Join PureBite</h3>
                    <p>Start enjoying fresher, healthier meals with home delivery of premium groceries from trusted local partners.</p>
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

export default Register;
