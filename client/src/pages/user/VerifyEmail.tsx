import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

const VerifyEmail = () => {
    const [loading, setLoading] = useState(true);
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                toast.error("Invalid verification link.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/users/verify-email?token=${token}`);
                toast.success(response.data.message || "Email verified successfully!");
                navigate("/login");
            } catch (error) {
                const message = error.response?.data?.error || error.response?.data?.message || "Verification failed.";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="container text-center mt-5">
            {loading ? (
                <h3>Verifying your email...</h3>
            ) : (
                <h3>Redirecting to login page...</h3>
            )}
        </div>
    );
};

export default VerifyEmail;
