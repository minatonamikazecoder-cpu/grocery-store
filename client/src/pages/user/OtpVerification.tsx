import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const OtpVerification = () => {
    // Get the email from localStorage where it was stored
    const email = localStorage.getItem("otpEmail");

    // Get the remaining time from localStorage if available
    const savedTimeLeft = localStorage.getItem("timeLeft") || "60";
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
    const [errors, setErrors] = useState<any>({});
    const [timeLeft, setTimeLeft] = useState(parseInt(savedTimeLeft, 10));
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
                localStorage.setItem("timeLeft", newTime.toString());  // Save updated time to localStorage
                return newTime;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [timeLeft]);

    // OTP Validation
    const validateOtp = (value: string) => {
        if (!value.trim()) return "OTP is required.";
        if (value.length !== 6 || isNaN(Number(value))) return "Enter a valid 6-digit OTP.";
        return null;
    };

    // Handle OTP Input Change for individual box
    const handleSingleBoxChange = (value: string, index: number) => {
        if (value && !/^\d$/.test(value)) return; // Only allow digits
        
        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);
        
        const combinedOtp = newOtpValues.join("");
        setErrors({ otp: validateOtp(combinedOtp) });

        // Auto-focus next box if filled
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Handle backspace navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const newOtpValues = [...otpValues];
            if (!otpValues[index] && index > 0) {
                // Focus previous box and clear it
                newOtpValues[index - 1] = "";
                setOtpValues(newOtpValues);
                const prevInput = document.getElementById(`otp-input-${index - 1}`);
                prevInput?.focus();
            } else {
                newOtpValues[index] = "";
                setOtpValues(newOtpValues);
            }
            const combinedOtp = newOtpValues.join("");
            setErrors({ otp: validateOtp(combinedOtp) });
        }
    };

    // Handle paste of 6 digits
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtpValues(digits);
            setErrors({ otp: validateOtp(pastedData) });
            // Focus last input
            const lastInput = document.getElementById("otp-input-5");
            lastInput?.focus();
        }
    };

    // Handle Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const combinedOtp = otpValues.join("");
        const error = validateOtp(combinedOtp);
        if (error) {
            setErrors({ otp: error });
            return;
        }

        try {
            const response = await api.post("/users/verify-otp", {
                email,
                otp: combinedOtp,
            });
            if (response.data.message === "OTP verified") {
                navigate("/reset-password");
            } else {
                setErrors({ otp: "Invalid OTP, please try again." });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            setErrors({ otp: msg });
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        setTimeLeft(60);
        setResendEnabled(false);
        localStorage.setItem("timeLeft", "60");  // Reset timeLeft in localStorage
        setOtpValues(Array(6).fill(""));

        try {
            // Send OTP resend request to backend
            const response = await api.post("/users/send-otp", {
                email,
            });

            if (response.data.message === "OTP resent successfully") {
                toast.info("OTP resent successfully!");
            }
        } catch (err: any) {
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
                                <div className="d-flex justify-content-between gap-2 my-4">
                                    {otpValues.map((value, index) => (
                                        <input
                                            key={index}
                                            id={`otp-input-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={value}
                                            onChange={(e) => handleSingleBoxChange(e.target.value, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className="text-center font-weight-bold"
                                            style={{
                                                width: "45px",
                                                height: "45px",
                                                fontSize: "1.25rem",
                                                borderRadius: "8px",
                                                border: "1px solid #e2e8f0",
                                                outline: "none"
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="error mb-4">{errors.otp}</p>
                                <input type="submit" value="Verify" className="btn btn-primary w-100" />
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
