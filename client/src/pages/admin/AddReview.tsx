import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddReview = () => {
    const [formData, setFormData] = useState({
        productId: "",
        userId: "",
        rating: "",
        review: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, userRes] = await Promise.all([
                    api.get("/products"),
                    api.get("/users")
                ]);
                setProducts(Array.isArray(productRes.data) ? productRes.data : (productRes.data?.data || []));
                setUsers(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
            } catch (err) {
                toast.error("Failed to load products or users.");
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        if (!value || value.trim() === "") {
            return `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
        }

        if (name === "review") {
            if (value.length < 10) return "Review must be at least 10 characters long.";
            if (value.length > 500) return "Review cannot exceed 500 characters.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            newErrors[key] = validateField(key, formData[key]);
        });

        setErrors(newErrors);

        if (Object.values(newErrors).every((err) => !err)) {
            try {
                await api.post("/reviews", formData);
                toast.success("Review submitted successfully!");
                navigate("/admin/reviews");
            } catch (err) {
                toast.error("Failed to submit review.");
            }
        }
    };

    return (
        <div>
            <h1 className="mt-4">Add Review</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/reviews">Reviews</Link></li>
                <li className="breadcrumb-item active">Add Review</li>
            </ol>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Product</label>
                            <select className="form-select" name="productId" value={formData.productId} onChange={handleChange}>
                                <option value="" disabled>Select a product</option>
                                {products.map((product) => (
                                    <option key={product._id || product.id} value={product._id || product.id}>
                                        {product.productName}
                                    </option>
                                ))}
                            </select>
                            {errors.productId && <div className="text-danger">{errors.productId}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">User</label>
                            <select className="form-select" name="userId" value={formData.userId} onChange={handleChange}>
                                <option value="" disabled>Select a user</option>
                                {users.map((user) => (
                                    <option key={user._id || user.id} value={user._id || user.id}>
                                        {user.firstName} {user.lastName}
                                    </option>
                                ))}
                            </select>
                            {errors.userId && <div className="text-danger">{errors.userId}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label d-block fw-semibold mb-2">Rating</label>
                            <div className="star-rating-selector d-flex gap-1" onMouseLeave={() => setHoverRating(null)}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = hoverRating !== null ? star <= hoverRating : star <= Number(formData.rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            className="btn p-0 border-0 bg-transparent star-btn"
                                            onClick={() => {
                                                setFormData({ ...formData, rating: String(star) });
                                                setErrors((prevErrors) => ({ ...prevErrors, rating: null }));
                                            }}
                                            onMouseEnter={() => setHoverRating(star)}
                                            style={{ outline: 'none' }}
                                        >
                                            <i 
                                                className={`fa fa-star fa-2x ${isActive ? "text-warning" : "text-muted"}`} 
                                                style={{ 
                                                    transition: 'color 0.15s ease, transform 0.15s ease',
                                                    cursor: 'pointer',
                                                    color: isActive ? '#ffb300' : '#e2e8f0',
                                                    transform: hoverRating === star ? 'scale(1.15)' : 'none'
                                                }}
                                            ></i>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.rating && <div className="text-danger mt-1">{errors.rating}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Review</label>
                            <textarea
                                className="form-control"
                                name="review"
                                value={formData.review}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Write your review"
                            />
                            {errors.review && <div className="text-danger">{errors.review}</div>}
                        </div>

                        <button type="submit" className="btn btn-primary">Submit Review</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddReview;
