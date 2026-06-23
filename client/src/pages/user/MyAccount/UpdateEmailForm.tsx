import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UpdateEmailForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);

    const validateEmail = (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return null;
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError(validateEmail(value));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }
        setError(null);
        navigate("/verify-email");
    };

    return (
        <div>
            <form className="edit-profile form" onSubmit={handleSubmit}>
                <div className="col-12">
                    <label className="form-label">Email</label>
                    <input 
                        type="text" 
                        className="w-100" 
                        name="email" 
                        placeholder="Your Email*" 
                        value={email} 
                        onChange={handleChange} 
                    />
                    {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
                </div>

                <div className="d-flex justify-content-end">
                    <input type="submit" value="Update Email" className="btn btn-primary w-100 mt-3" />
                </div>
            </form>
        </div>
    );
};

export default UpdateEmailForm;