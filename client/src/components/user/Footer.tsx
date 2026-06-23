import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Footer = (props) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email); // Simple email validation
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        // Required field validation
        if (!value.trim()) {
            setError("Email is required");
        } else if (!validateEmail(value)) {
            setError("Please enter a valid email address");
        } else {
            setError("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError("Email is required");
            toast.error("Email is required!");
        } else if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            toast.error("Invalid email address!");
        } else {
            setError("");
            toast.success("Subscribed successfully!");
            setEmail(""); // Clear input after successful submission
        }
    };

    return (
        <div className="footer container-fluid d-flex flex-column border-top">
            <div className="container">
                <div className="row d-flex justify-content-between align-items-start gap-4 my-4">
                    <div className="col-12 col-md-3">
                        <div className="logo mb-3">
                            <Link to="/" className="nav-link p-0 fw-bolder fs-3 text-dark" style={{ letterSpacing: "-0.5px" }}>
                                PureBite<span style={{ color: "var(--primary)" }}>.</span>
                            </Link>
                            <p className="text-muted mt-2">Taste the Goodness. Freshness delivered straight to your doorstep.</p>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <h5>Quick Links</h5>
                        <ul className="nav flex-column">
                            <li className="nav-item mb-2"><Link to="/" className="nav-link p-0 text-muted">Home</Link></li>
                            <li className="nav-item mb-2"><Link to="/shop" className="nav-link p-0 text-muted">Shop</Link></li>
                            <li className="nav-item mb-2"><Link to="/contact" className="nav-link p-0 text-muted">Contact</Link></li>
                            <li className="nav-item mb-2"><Link to="/order-history" className="nav-link p-0 text-muted">Your Orders</Link></li>
                            <li className="nav-item mb-2"><Link to="/cart" className="nav-link p-0 text-muted">Cart</Link></li>
                        </ul>
                    </div>

                    <div className="col-12 col-md-5">
                        <form onSubmit={handleSubmit} className="w-100">
                            <h5>Subscribe to our newsletter</h5>
                            <p>Monthly digest of what's new and exciting from us.</p>
                            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
                                <label htmlFor="newsletter1" className="visually-hidden">Email address</label>
                                <input 
                                    id="newsletter1" 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Email address" 
                                    value={email} 
                                    onChange={handleChange} 
                                />
                                <button className="btns" type="submit">Subscribe</button>
                            </div>
                            {error && <small className="text-danger d-block mt-1">{error}</small>}
                        </form>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between border-top mt-4 pt-3">
                    <p className="text-muted">© 2026 PureBite Inc. All rights reserved.</p>
                    <p className="text-muted">Made with ❤️ for fresh living.</p>
                </div>
            </div>
        </div>
    );
};

export default Footer;
