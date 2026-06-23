import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

interface UserType {
  firstName: string;
  lastName: string;
}

interface CartItemType {
  productId: string;
  quantity: number;
  product: {
    productName: string;
    stock?: number;
  };
}

const UpdateCart = () => {
  const { userId, productId } = useParams<{ userId: string; productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [productName, setProductName] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCartAndUserData = async () => {
      try {
        setLoading(true);
        // Fetch user and cart concurrently
        const [userRes, cartRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/cart/${userId}`)
        ]);

        const user: UserType = userRes.data;
        setUserName(`${user.firstName} ${user.lastName}`);

        const cartItems: CartItemType[] = cartRes.data?.items || [];
        const item = cartItems.find((i) => i.productId === productId);
        if (item) {
          setQuantity(item.quantity);
          setProductName(item.product?.productName || "Unknown Product");
          setStock(item.product?.stock);
        } else {
          toast.error("Product not found in user's cart.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load cart or user details.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && productId) {
      fetchCartAndUserData();
    }
  }, [userId, productId]);

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    if (quantity < 1) {
      formErrors.quantity = "Quantity must be at least 1";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.put(`/cart/${userId}`, { productId, quantity });
      toast.success("Cart record updated successfully");
      navigate(`/admin/cart/${userId}`);
    } catch (err) {
      toast.error("Failed to update cart record.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !productName) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mt-4">Update Cart</h1>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/users">Users</Link></li>
          <li className="breadcrumb-item"><Link to={`/admin/cart/${userId}`}>Cart</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Update Cart</li>
        </ol>
      </nav>

      <h5>User: {userName}</h5>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product</label>
              <input type="text" className="form-control" value={productName} disabled />
            </div>
             <div className="mb-3">
              <label className="form-label d-block">Quantity</label>
              <div className="modern-qty-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || loading}
                >
                  <i className="fa fa-minus"></i>
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={loading || (stock !== undefined && quantity >= stock)}
                >
                  <i className="fa fa-plus"></i>
                </button>
              </div>
              {errors.quantity && <div className="text-danger mt-2">{errors.quantity}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Cart"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCart;