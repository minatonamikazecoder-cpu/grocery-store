import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../utils/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);

        if (!newEmail.trim()) {
            setError('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setError('Enter a valid email address');
        } else {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/users/send-otp', { email });

            if (response.data.message === "OTP sent successfully") {
                // Store email temporarily (for OTP verify page)
                localStorage.setItem("otpEmail", email);
                navigate("/verify-otp");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="row p-3 g-3 justify-content-center">
                <div className="col-md-6">
                    <div className="login-form d-flex flex-column justify-content-center h-100 align-items-center mt-4">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Forgot Password?</h2>
                            <div className="mb-4">Enter an email account to reset password</div>
                            <form onSubmit={handleSubmit}>
                                <input 
                                    type="text" 
                                    id="otpEmail" 
                                    name="email" 
                                    className="w-100" 
                                    placeholder="Email" 
                                    value={email} 
                                    onChange={handleChange}
                                />
                                {error && <p className="error">{error}</p>}
                                <input 
                                    type="submit" 
                                    value={loading ? "Sending..." : "Send OTP"} 
                                    className="btn-msg w-100 mt-2" 
                                    disabled={loading}
                                />
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

export default ForgotPassword;
