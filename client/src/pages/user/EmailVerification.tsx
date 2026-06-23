import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EmailVerification = () => {
    const oldEmail = "old@example.com";
    const newEmail = "new@example.com";
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldOtp: "",
        newOtp: ""
    });
    const [errors, setErrors] = useState<any>({});
    const savedTimeLeft = localStorage.getItem("emailVerificationTimeLeft") || "60";
    const [timeLeft, setTimeLeft] = useState(parseInt(savedTimeLeft, 10));
    const [resendEnabled, setResendEnabled] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setResendEnabled(true);
            return;
        }
        const countdown = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                localStorage.setItem("emailVerificationTimeLeft", newTime.toString());
                return newTime;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [timeLeft]);

    const validateOtp = (otp) => {
        if (!otp.trim()) return "OTP is required.";
        if (otp.length !== 6 || isNaN(otp)) return "Enter a valid 6-digit OTP.";
        return null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: validateOtp(value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateOtp(formData[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        navigate("/account", { state: { message: "Email updated successfully!" } });
    };

    const handleResendOtp = () => {
        setTimeLeft(60);
        setResendEnabled(false);
        localStorage.setItem("emailVerificationTimeLeft", "60");
        toast.info("OTP resent successfully!");
    };

    return (
        <div className="container">
            <div className="row p-3 g-3 justify-content-center">
                <div className="col-md-6">
                    <div className="login-form d-flex flex-column justify-content-center h-100 align-items-center mt-4">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Enter OTPs</h2>
                            <div className="mb-4">Enter OTPs for your old and new email</div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">Old Email: <small>{oldEmail}</small></div>
                                <input 
                                    type="text" 
                                    name="oldOtp" 
                                    className="w-100" 
                                    placeholder="OTP for Old Email" 
                                    value={formData.oldOtp} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.oldOtp}</p>

                                <div className="mb-3">New Email: <small>{newEmail}</small></div>
                                <input 
                                    type="text" 
                                    name="newOtp" 
                                    className="w-100" 
                                    placeholder="OTP for New Email" 
                                    value={formData.newOtp} 
                                    onChange={handleChange} 
                                />
                                <p className="error mb-3">{errors.newOtp}</p>

                                <input type="submit" value="Verify OTPs" className="btn btn-primary w-100" />
                                <div className="mt-4 text-center">
                                    {timeLeft > 0 ? (
                                        <div className="text-danger">Resend OTP in {timeLeft} seconds</div>
                                    ) : (
                                        <button onClick={handleResendOtp} className="otp ms-2">
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
