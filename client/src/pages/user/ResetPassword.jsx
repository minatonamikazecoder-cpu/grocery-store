import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [email, setEmail] = useState("");  // Store email here
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve email from localStorage or from URL query params if needed
        const storedEmail = localStorage.getItem("otpEmail");
        if (!storedEmail) {
            toast.error("Email not found. Please request a password reset.");
            navigate("/forgot-password");  // Redirect to forgot password page if email is not found
        }
        setEmail(storedEmail);  // Set email in the state
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate and clear errors when corrected
        const error = validateField(name, value);
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;
        if (!value.trim()) {
            error = name === "newPassword" ? "New password is required" : "Confirm password is required";
        } else if (name === "newPassword" && value.length < 6) {
            error = "Password must be at least 6 characters long";
        } else if (name === "confirmPassword" && value !== formData.newPassword) {
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
            // Send the password reset request to the backend
            const response = await api.post("/users/reset-password", {
                email,
                newPassword: formData.newPassword
            });

            if (response.data.message === "Password updated successfully") {
                toast.success("Password reset successful!");
                navigate("/login");  // Redirect to login page after successful password reset
            } else {
                toast.error("Failed to reset password. Please try again.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(msg);
        }
    };

    return (
        <div className="container">
            <div className="row p-3 g-3 justify-content-center">
                <div className="col-md-6">
                    <div className="login-form d-flex flex-column justify-content-center h-100 align-items-center mt-4">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Reset Password</h2>
                            <div className="mb-4">Enter your new password</div>
                            <form onSubmit={handleSubmit}>
                                <input 
                                    type="password" 
                                    name="newPassword" 
                                    className="w-100 " 
                                    placeholder="New Password" 
                                    value={formData.newPassword} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.newPassword}</p>

                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    className="w-100" 
                                    placeholder="Confirm New Password" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                />
                                <p className="error  mb-3">{errors.confirmPassword}</p>

                                <input type="submit" value="Reset Password" className="btn-msg w-100" />
                                <div className="mt-4 text-center">
                                    <Link to="/login" className="dim link ms-2">Back to log in</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
