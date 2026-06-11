import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const OtpVerification = () => {
    // Get the email from localStorage where it was stored
    const email = localStorage.getItem("otpEmail");

    // Get the remaining time from localStorage if available
    const savedTimeLeft = localStorage.getItem("timeLeft") || 60;
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [timeLeft, setTimeLeft] = useState(parseInt(savedTimeLeft));
    const [resendEnabled, setResendEnabled] = useState(false);
    const navigate = useNavigate();

    // Countdown Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setResendEnabled(true);
            return;
        }
        const countdown = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                localStorage.setItem("timeLeft", newTime);  // Save updated time to localStorage
                return newTime;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [timeLeft]);

    // OTP Validation
    const validateOtp = (value) => {
        if (!value.trim()) return "OTP is required.";
        if (value.length !== 6 || isNaN(value)) return "Enter a valid 6-digit OTP.";
        return null;
    };

    // Handle OTP Input Change
    const handleOtpChange = (e) => {
        const value = e.target.value;
        setOtp(value);
        setErrors({ otp: validateOtp(value) });
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateOtp(otp);
        if (error) {
            setErrors({ otp: error });
            return;
        }

        try {
            const response = await api.post("/users/verify-otp", {
                email,
                otp,
            });
            if (response.data.message === "OTP verified") {
                navigate("/reset-password");
            } else {
                setErrors({ otp: "Invalid OTP, please try again." });
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            setErrors({ otp: msg });
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        setTimeLeft(60);
        setResendEnabled(false);
        localStorage.setItem("timeLeft", 60);  // Reset timeLeft in localStorage

        try {
            // Send OTP resend request to backend
            const response = await api.post("/users/send-otp", {
                email,
            });

            if (response.data.message === "OTP resent successfully") {
                toast.info("OTP resent successfully!");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong while resending OTP.";
            toast.error(msg);
        }
    };

    return (
        <div className="container">
            <div className="row p-3 g-3 justify-content-center">
                <div className="col-md-6">
                    <div className="login-form d-flex flex-column justify-content-center h-100 align-items-center mt-4">
                        <div className="mb-3 w-75">
                            <h2 className="mb-3">Enter OTP</h2>
                            <div className="mb-4">Enter the OTP we sent to your email</div>
                            <div className="mb-2">OTP sent to: <small>{email}</small></div>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="number"
                                    name="otp"
                                    className="w-100"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                                <p className="error mb-4">{errors.otp}</p>
                                <input type="submit" value="Verify" className="btn-msg w-100" />
                            </form>
                            <div className="mt-4 text-center">
                                {timeLeft > 0 ? (
                                    <div className="text-danger">Resend OTP in {timeLeft} seconds</div>
                                ) : (
                                    <button onClick={handleResendOtp} className="otp ms-2" disabled={!resendEnabled}>
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
