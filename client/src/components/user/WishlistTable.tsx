import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../../utils/api";
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

interface WishlistTableProps {
  userId: string;
  wishlist?: Product[] | null;
  setWishlist?: React.Dispatch<React.SetStateAction<Product[] | null>>;
}

const WishlistTable = ({ userId, wishlist, setWishlist }: WishlistTableProps) => {
  const [localWishlist, setLocalWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(wishlist === undefined || wishlist === null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const { updateCartCount, updateWishlistCount } = useCart();

  const isControlled = wishlist !== undefined && setWishlist !== undefined;
  const currentWishlist = isControlled ? (wishlist || []) : localWishlist;

  const updateWishlistState = (val: Product[] | ((prev: Product[]) => Product[])) => {
    if (isControlled) {
      setWishlist!(prev => {
        const base = prev || [];
        return typeof val === 'function' ? val(base) : val;
      });
    } else {
      setLocalWishlist(prev => {
        return typeof val === 'function' ? val(prev) : val;
      });
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const res = await api.get(`/wishlist/${userId}`);
      const productIds = res.data?.wishlist?.productIds || [];
      updateWishlistState(productIds);
      updateWishlistCount(productIds.length);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    if (isControlled && wishlist !== null) {
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [userId, isControlled, wishlist]);

  // Handle delete from wishlist
  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${userId}/remove`, {
        data: { productId }
      });
      toast.success("Product removed from wishlist!");
      updateWishlistState(prev => prev.filter(item => item.id !== productId && item._id !== productId));
      updateWishlistCount(currentWishlist.length - 1);
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      toast.error("Failed to remove product.");
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
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

  if (!loading && currentWishlist.length === 0) {
    return (
      <div className="empty-state-container my-5">
        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <h3 className="empty-state-title">Your Wishlist is Empty</h3>
        <p className="empty-state-text">
          You haven't saved any items to your wishlist yet. Browse our store to find your favorite groceries!
        </p>
        <Link to="/shop" className="btn btn-primary empty-state-btn">
          Explore Products
        </Link>
      </div>
    );
  }

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
          <>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '4px', marginRight: '10px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '150px', height: '18px', marginBottom: '0' }}></div>
                  </div>
                </td>
                <td>
                  <div className="skeleton skeleton-text" style={{ width: '60px', height: '18px', margin: 'auto' }}></div>
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    <div className="skeleton skeleton-button" style={{ width: '100px', height: '38px', marginRight: '8px' }}></div>
                    <div className="skeleton skeleton-button" style={{ width: '80px', height: '38px' }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </>
        ) : (
          currentWishlist.map((item) => {
            const itemId = item.id || item._id;
            return (
              <tr key={itemId}>
                <td>
                  <img
                    src={item.productImage || PLACEHOLDER_IMAGE}
                    alt={item.productName}
                    className="image-item d-inline-block"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px' }}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="d-inline-block">{item.productName}</div>
                </td>
                <td>₹{item.salePrice}</td>
                <td>
                  <button
                    className="btn btn-primary update-btn"
                    onClick={() => itemId && handleAddToCart(itemId)}
                    disabled={addingToCartId === itemId}
                  >
                    {addingToCartId === itemId ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    className="btn btn-primary delete-btn ms-2"
                    onClick={() => itemId && handleDelete(itemId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default WishlistTable;
