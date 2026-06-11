import React, { useEffect, useState } from 'react';
import api from "../../utils/api";
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const WishlistTable = ({ userId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const { updateCartCount,updateWishlistCount } = useAuth();

  // Fetch wishlist
const fetchWishlist = async () => {
  try {
    const res = await api.get(`/wishlist/${userId}`);
    const productIds = res.data?.wishlist?.productIds || [];
    setWishlist(productIds);
    updateWishlistCount(productIds.length);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    toast.error("Failed to load wishlist.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (userId) fetchWishlist();
  }, [userId]);

  // Handle delete from wishlist
  const handleDelete = async (productId) => {
    try {
      await api.delete(`/wishlist/${userId}/remove`, {
        data: { productId }
      });
      toast.success("Product removed from wishlist!");
      setWishlist(prev => prev.filter(item => item._id !== productId));
      updateWishlistCount(wishlist.length);
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      toast.error("Failed to remove product.");
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    if (!userId) {
      toast.error("Please log in to add to cart.");
      return;
    }

    setAddingToCartId(productId);
    try {
      const response = await api.post(`/cart`, {
        userId,
        productId,
        quantity: 1,
      });

      toast.success("Product added to cart successfully!");
      if (response.data?.items?.length) {
        updateCartCount(response.data.items.length);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <table className="table cart-table text-nowrap">
      <thead>
        <tr className="heading text-center">
          <th className='text-start'>Product</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan="3" className="text-center">Loading...</td></tr>
        ) : wishlist.length > 0 ? (
          wishlist.map((item) => (
            <tr key={item._id}>
              <td>
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="image-item d-inline-block"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px' }}
                />
                <div className="d-inline-block">{item.productName}</div>
              </td>
              <td>₹{item.salePrice}</td>
              <td>
                <button
                  className="primary-btn update-btn"
                  onClick={() => handleAddToCart(item._id)}
                  disabled={addingToCartId === item._id}
                >
                  {addingToCartId === item._id ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  className="primary-btn delete-btn ms-2"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center">Your wishlist is empty.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default WishlistTable;
