import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const ProductDetails = () => {
    const { id } = useParams();
    const { user, updateCartCount } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedQuantity, setSelectedQuantity] = useState(null);
    const [review, setReview] = useState({ rating: "", review: "" });
    const [errors, setErrors] = useState({});
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            console.error("Failed to fetch product", err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews?productId=${id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };
    useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (user?._id) {
        checkPurchaseAndReview();
    }
}, [id, user?._id]);

const checkPurchaseAndReview = async () => {
    try {
        if (!user?._id) return;

        const res = await api.get(`/orders/has-purchased/${user._id}/${id}`);
        setHasPurchased(res.data.purchased);

        // Check if user has already reviewed
        const reviewRes = await api.get(`/reviews?productId=${id}&userId=${user._id}`);
        setHasReviewed(reviewRes.data.length > 0);
    } catch (err) {
        console.error("Error checking purchase/review", err);
    }
};

    const finalPrice = product ? (product.salePrice - (product.salePrice * product.discount / 100)).toFixed(2) : "0.00";

    const handleQuantityChange = (quantity) => {
        setSelectedQuantity(quantity);
        setErrors(prev => ({ ...prev, quantity: "" }));
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReview({ ...review, [name]: value });
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateField = (name, value) => {
        if (name === "rating" && !value) return "Rating is required";
        if (name === "review" && !value.trim()) return "Review cannot be empty";
        if (name === "quantity" && !value) return "Please select a quantity";
        return null;
    };

    const validateReview = () => {
        const newErrors = {
            rating: validateField("rating", review.rating),
            review: validateField("review", review.review),
        };
        Object.keys(newErrors).forEach(key => !newErrors[key] && delete newErrors[key]);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateQuantity = () => {
        const newErrors = {};
        if (!selectedQuantity) newErrors.quantity = "Please select a quantity";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCartSubmit = async(productId) => {
        if (validateQuantity()) {
            if (!user?._id) {
      toast.error("Please log in to add to cart.");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await api.post(`/cart`, {
        userId: user._id,
        productId,
        quantity: selectedQuantity,
      });

      toast.success("Product added to cart successfully!");
       setSelectedQuantity(null);
            setErrors({});
      if (response.data?.items?.length) {
        updateCartCount(response.data.items.length);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
           
        }
    };

    const submitReview = async (e) => {
    e.preventDefault();
    if (!validateReview()) return;

    try {
        if (!user?._id) {
            toast.error("You must be logged in to submit a review.");
            return;
        }

        await api.post("/reviews", {
            productId: id,
            userId: user._id,
            rating: review.rating,
            review: review.review,
        });

        toast.success("Review submitted!");
        setHasReviewed(true);
        setReview({ rating: "", review: "" });
        fetchReviews();
    } catch (err) {
        toast.error("Failed to submit review");
    }
};

    if (!product) return <div className="text-center py-5">Loading...</div>;

    return (
        <div className="container sitemap mt-5">
            <p>
                <Link to="/" className="text-decoration-none dim link">Home /</Link>{" "}
                <Link to="/shop" className="text-decoration-none dim link">Shop /</Link>{" "}
                {product.name}
            </p>

            <div className="row">
                <div className="col-md-5">
                    <img src={product.productImage} alt="Product" className="img-thumbnail p-3 w-100" />
                </div>
                <div className="col-md-7 px-5 d-flex flex-column align-items-start">
                    <h4 className="product-title">{product.productName}</h4>
                    <div className="rating-section-description">
                        <div className="ratings">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`fa fa-star ${product.averageRating > i ? "checked" : ""}`}></span>
                            ))}
                        </div>
                        <div className="review-count ps-1">({product.totalReviews || 0})</div>
                    </div>
                    <p className="product-description mt-3">{product.description}</p>
                    <div className="row align-items-center mt-3 w-100">
                        <div className="col-3">Price</div>
                        <div className="col-9 price">₹{finalPrice}</div>
                    </div>
                    <div className="row align-items-center mt-3 w-100">
                        <div className="col-3">Quantity</div>
                        <div className="col-9 d-flex flex-wrap">
                            {[1, 2, 3, 4, 5].map(q => (
                                <div key={q} onClick={() => handleQuantityChange(q)} className="quantity">
                                    <div className={selectedQuantity === q ? "selected" : ""}>{q}</div>
                                </div>
                            ))}
                        </div>
                        {errors.quantity && <p className="text-danger">{errors.quantity}</p>}
                    </div>
                   <button 
  onClick={()=>handleCartSubmit(product._id)} 
  className="add-to-cart-btn primary-btn w-100 mt-4"
  disabled={addingToCart}
>
  {addingToCart ? "Adding..." : "Add to Cart"}
</button>

                    
                </div>
            </div>

            <div className="container my-5">
                <h4 className="mb-4 text-center fw-bold">Customer Reviews</h4>
                <div className="row">
                    <div className="col-6">
                    {hasPurchased ? (
    hasReviewed ? (
        <div className="alert alert-info">You have already reviewed this product.</div>
    ) : (
        <form onSubmit={submitReview} className="mb-4">
            {/* Rating and Review inputs go here (unchanged) */}
            <div className="mb-3">
                <label className="d-block">Rating</label>
                <select name="rating" className="form w-100 p-2 rounded" onChange={handleReviewChange} value={review.rating}>
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                </select>
                {errors.rating && <p className="text-danger">{errors.rating}</p>}
            </div>
            <div className="mb-3">
                <label className="d-block">Review</label>
                <textarea name="review" className="w-100" rows="3" placeholder="Please add your review" onChange={handleReviewChange} value={review.review}></textarea>
                {errors.review && <p className="text-danger">{errors.review}</p>}
            </div>
            <button type="submit" className="primary-btn">Submit Review</button>
        </form>
    )
) : (
    <div className="alert alert-warning">Only customers who purchased this product can write a review.</div>
)}
                    </div>
                    <div className="col-6">
                        <div className="row align-items-stretch">
                            {reviews && reviews.map(r => (
                                <div key={r._id} className="col-md-6 mb-4">
                                    <div className="review-card card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                {r.userId?.firstName} {r.userId?.lastName}
                                            </h5>
                                            <h6 className="card-subtitle mb-2 text-warning">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`fa fa-star ${r.rating > i ? "checked" : ""}`}></span>
                                                ))}
                                            </h6>
                                            <p className="card-text">{r.review}</p>
                                            <small className="text-muted mb-0">
                                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                                            </small>
                                        </div>
                                        {r.reply && (
                                            <div className="card-body ms-5">
                                                <h5 className="card-title">{r.replier || "Seller"}</h5>
                                                <p className="card-text">{r.reply}</p>
                                                <small className="text-muted mb-0">
                                                    {r.replyDate ? new Date(r.replyDate).toLocaleDateString() : ""}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
