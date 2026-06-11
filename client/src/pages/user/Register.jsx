import { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;
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
        <div className="container">
            <div className="row p-3 g-3 mt-4 justify-content-center h-100 align-items-center">
                <div className="col-md-6">
                    <div className="register-form d-flex flex-column justify-content-center h-100 align-items-center">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Create an account</h2>
                            <div className="mb-4">Enter your details below</div>
                            <form className="login-form" id="registrationForm" onSubmit={handleSubmit}>
                                <div className="names d-flex gap-3">
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        className="w-50 p-2" 
                                        placeholder="First Name" 
                                        value={formData.firstName} 
                                        onChange={handleChange} 
                                    />
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        className="w-50 p-2" 
                                        placeholder="Last Name" 
                                        value={formData.lastName} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="d-flex gap-3">
                                    <p className="error mb-3 w-50">{errors.firstName}</p>
                                    <p className="error mb-3 w-50">{errors.lastName}</p>
                                </div>

                                <input 
                                    type="text" 
                                    name="email" 
                                    className="w-100 p-2" 
                                    placeholder="Email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.email}</p>

                                <input 
                                    type="text" 
                                    name="phone" 
                                    className="w-100 p-2" 
                                    placeholder="Mobile Number" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.phone}</p>

                                <input 
                                    type="password" 
                                    name="password" 
                                    className="w-100 p-2" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.password}</p>

                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    className="w-100 p-2" 
                                    placeholder="Confirm Password" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.confirmPassword}</p>

                                <input type="submit" value="Create an account" className="btn-msg w-100" />
                                <div className="mt-4 text-center">
                                    Already have an account? <Link to="/login" className="dim link ms-2">Log in</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
