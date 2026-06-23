import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const EmailVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const oldEmail = user?.email || "admin@example.com";
    const newEmail = location.state?.newEmail || "newadmin@example.com";

    const [otpForm, setOtpForm] = useState({
        oldEmailOTP: "", // OTP for old email
        newEmailOTP: "", // OTP for new email
    });

    const [errors, setErrors] = useState<any>({});

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOtpForm({ ...otpForm, [name]: value });

        // Validate OTP on change
        const error = validateField(name, value);
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;

        if (name === "oldEmailOTP") {
            if (!value) {
                error = "OTP for old email is required.";
            } else if (!/^\d{6}$/.test(value)) {
                error = "OTP must be 6 digits.";
            }
        }

        if (name === "newEmailOTP") {
            if (!value) {
                error = "OTP for new email is required.";
            } else if (!/^\d{6}$/.test(value)) {
                error = "OTP must be 6 digits.";
            }
        }

        return error;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate both OTP fields
        const formErrors = {};
        Object.keys(otpForm).forEach((field) => {
            const error = validateField(field, otpForm[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // Simulate OTP verification (replace with actual API call)
        navigate("/admin/my-profile", {
            state: { message: "Email updated successfully!" },
        });
    };

    return (
        <div>
            <h1 className="mt-4">Email Verification</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item active">Email Verification</li>
            </ol>

            <div className="card mb-4">
                <div className="card-header"><h4>Verify OTPs</h4></div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        

                        {/* Old Email OTP */}
                        <div className="mb-3">
                            <label className="form-label">OTP for Old Email: {oldEmail}</label>

                            <input
                                type="number"
                                className="form-control"
                                name="oldEmailOTP"
                                value={otpForm.oldEmailOTP}
                                onChange={handleOtpChange}
                                placeholder="Enter 6-digit OTP"
                            />
                            {errors.oldEmailOTP && (
                                <p className="text-danger">{errors.oldEmailOTP}</p>
                            )}
                        </div>

                        {/* New Email OTP */}
                        <div className="mb-3">
                            <label className="form-label">OTP for New Email: {newEmail}</label>
                            <input
                                type="number"
                                className="form-control"
                                name="newEmailOTP"
                                value={otpForm.newEmailOTP}
                                onChange={handleOtpChange}
                                placeholder="Enter 6-digit OTP"
                            />
                            {errors.newEmailOTP && (
                                <p className="text-danger">{errors.newEmailOTP}</p>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Verify OTPs
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;