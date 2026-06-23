import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { getDiscountedPrice } from "../../utils/price";

interface ProductType {
  id: string;
  productName: string;
  description: string;
  productImage: string;
  salePrice: number;
  costPrice: number;
  discount: number;
  stock: number;
  isActive: boolean;
  category?: {
    categoryName: string;
  };
  averageRating?: string | number;
  totalReviews?: number;
}

interface ReviewType {
  id: string;
  rating: number;
  review: string;
  reply?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

const ViewProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews?productId=${id}`)
      ]);
      setProduct(prodRes.data.data);
      setReviews(revRes.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch product details or reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleProductDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/products/${id}`);
          Swal.fire("Deleted!", "Product has been deleted.", "success");
          navigate("/admin/products");
        } catch (err) {
          Swal.fire("Error", "Failed to delete product.", "error");
        }
      }
    });
  };

  const handleReviewDelete = (reviewId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This review will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/reviews/${reviewId}`);
          setReviews(reviews.filter((r) => r.id !== reviewId));
          Swal.fire("Deleted!", "Review has been deleted.", "success");
        } catch (err) {
          Swal.fire("Error", "Failed to delete review.", "error");
        }
      }
    });
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }
    try {
      await api.put(`/reviews/${selectedReviewId}/reply`, { reply: replyText });
      Swal.fire("Success!", "Reply updated successfully.", "success");
      setReplyText("");
      setSelectedReviewId(null);
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to update reply.", "error");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || "Product not found"}</div>
        <Link to="/admin/products" className="btn btn-primary">Back to Products</Link>
      </div>
    );
  }

  const salePriceVal = parseFloat(product.salePrice?.$numberDecimal !== undefined ? product.salePrice.$numberDecimal : (product.salePrice || 0));
  const discountVal = parseFloat(product.discount?.$numberDecimal !== undefined ? product.discount.$numberDecimal : (product.discount || 0));
  const costPriceVal = parseFloat(product.costPrice?.$numberDecimal !== undefined ? product.costPrice.$numberDecimal : (product.costPrice || 0));

  const priceAfterDiscount = getDiscountedPrice(salePriceVal, discountVal);

  return (
    <div>
      <h1 className="mt-4">View Product</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
        <li className="breadcrumb-item"><Link to="/admin/products">Products</Link></li>
        <li className="breadcrumb-item active">View Product</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header"><h4>Product Information</h4></div>
        <div className="card-body d-flex flex-wrap flex-md-nowrap">
          <img 
            src={product.productImage ? `/img/items/products/${product.productImage}` : "/img/placeholder.png"} 
            alt="Product" 
            className="me-md-4 mb-3 mb-md-0" 
            style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }} 
          />
          <div>
            <p><strong>Product Name:</strong> {product.productName}</p>
            <p><strong>Average Rating:</strong> {product.averageRating || "No ratings yet"}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Stock Quantity:</strong> {product.stock}</p>
            <p><strong>Cost Price:</strong> ₹{costPriceVal}</p>
            <p><strong>Sale Price:</strong> ₹{salePriceVal}</p>
            <p><strong>Discount:</strong> {discountVal}%</p>
            <p><strong>Price After Discount:</strong> ₹{priceAfterDiscount.toFixed(2)}</p>
            <p><strong>Category:</strong> {product.category?.categoryName || "Uncategorized"}</p>
            <div className="mt-3">
              <Link to={`/admin/update-product/${product.id || product._id}`} className="btn btn-success me-2">
                Update Product
              </Link>
              <button className="btn btn-danger" onClick={handleProductDelete}>Delete Product</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><h4>Ratings and Reviews</h4></div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Reply</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.user ? `${review.user.firstName} ${review.user.lastName}` : "Anonymous"}</td>
                      <td>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className="text-warning">
                            {i < review.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </td>
                      <td>{review.review}</td>
                      <td>{review.reply || "-"}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => {
                            setSelectedReviewId(review.id);
                            setReplyText(review.reply || "");
                          }}
                        >
                          {review.reply ? "Edit Reply" : "Reply"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReviewDelete(review.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedReviewId && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to Review</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedReviewId(null)}></button>
              </div>
              <div className="modal-body">
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder="Type your reply here..."
                />
                {replyError && <p className="text-danger mt-2">{replyError}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedReviewId(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReplySubmit}>Submit Reply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;