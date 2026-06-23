import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const UpdateReview = () => {
  const [formData, setFormData] = useState({
    productid: "",
    rname: "",
    rating: "",
    review: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const { id } = useParams();  // Get id from the URL
  const navigate = useNavigate();  // Hook to navigate to different pages

  useEffect(() => {
    // Fetch review data from backend
    const fetchReview = async () => {
      try {
        const response = await api.get(`/reviews/${id}`);
        const reviewData = response.data;

        // Set fetched review data to form fields
        setFormData({
          productid: reviewData.productId.productName,  // Set the product name
          rname: `${reviewData.userId.firstName} ${reviewData.userId.lastName}`, // Set the user name
          rating: reviewData.rating,
          review: reviewData.review,
        });
      } catch (err) {
        console.error("Error fetching review:", err);
        toast.error("Error fetching review data.");
      }
    };

    fetchReview();
  }, [id]);  // Dependency on id, so it fetches data whenever id changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateField = (name, value) => {
    if (name === "review") {
      if (!value || value.trim() === "") return "Review is required.";
      if (value.length < 10) return "Review must be at least 10 characters long.";
      if (value.length > 500) return "Review cannot exceed 500 characters.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors: any = {};
    newErrors.review = validateField("review", formData.review);
    newErrors.rating = formData.rating ? null : "Rating is required.";
    setErrors(newErrors);

    if (!newErrors.review && !newErrors.rating) {
      try {
        // Send update request to the backend
        const updatedReview = await api.put(
          `/reviews/${id}`,
          formData
        );
        
        // If update is successful, show toast and redirect
        toast.success("Review updated successfully!");
        navigate("/admin/reviews");  // Redirect to reviews page
      } catch (err) {
        console.error("Error updating review:", err);
        toast.error("Error updating review.");
      }
    }
  };

  return (
    <div>
      <h1 className="mt-4">Update Review</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/admin">Dashboard</Link>
        </li>
        <li className="breadcrumb-item">
          <Link to="/admin/reviews">Reviews</Link>
        </li>
        <li className="breadcrumb-item active">Update Review</li>
      </ol>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product</label>
              <input
                type="text"
                className="form-control"
                value={formData.productid}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label">User</label>
              <input
                type="text"
                className="form-control"
                value={formData.rname}
                disabled
              />
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
              <label htmlFor="review" className="form-label">
                Review
              </label>
              <textarea
                className="form-control"
                id="review"
                name="review"
                rows={3}
                value={formData.review}
                onChange={handleChange}
                placeholder="Enter review"
              ></textarea>
              {errors.review && <div className="text-danger">{errors.review}</div>}
            </div>

            <button type="submit" className="btn btn-primary">
              Update Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateReview;
