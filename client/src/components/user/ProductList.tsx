import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { Product } from "../../types";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import { getFormattedDiscountedPrice } from "../../utils/price";

import SkeletonCard from "./SkeletonCard";

interface ProductListProps {
  products: Product[];
  loading?: boolean;
}

const ProductList = ({ products, loading }: ProductListProps) => {
  const { user } = useAuth();
  const { updateCartCount, updateWishlistCount } = useCart();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products ? products.slice(indexOfFirstProduct, indexOfLastProduct) : [];

  const totalPages = products ? Math.ceil(products.length / productsPerPage) : 0;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      setLoadingWishlist(true);
      try {
        const response = await api.get(`/wishlist/${user.id}`);
        const productIds = response.data.wishlist?.productIds.map((p: any) => p.id || p._id);
        setWishlist(productIds || []);
      } catch (error) {
        // toast.error("Failed to fetch wishlist.");
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please log in to use wishlist.");
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${user.id}/remove`, {
          data: { productId },
        });
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.info("Product removed from wishlist.");
      } else {
        const res = await api.post(`/wishlist/${user.id}/add`, {
          productId,
        });
        setWishlist((prev) => [...prev, productId]);
        toast.success("Product added to wishlist.");
        if (res.data?.wishlist?.productIds?.length >= 0) {
          updateWishlistCount(res.data.wishlist.productIds.length);
        }
      }
    } catch (error) {
      toast.error("Wishlist update failed.");
    }
  };

  const handleAddToCartClick = async (productId: string) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    setAddingToCartId(productId);
    try {
      const response = await api.post(`/cart`, {
        userId: user.id,
        productId,
        quantity: 1,
      });

      toast.success("Product added to cart successfully!");
      if (response.data?.items?.length) {
        updateCartCount(response.data.items.length);
      }
    } catch (error) {
      toast.error("Failed to add product to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="row justify-content-start align-items-stretch">
        {[...Array(8)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="row justify-content-start align-items-stretch">
      {!currentProducts || currentProducts.length === 0 ? (
        <div className="empty-state-container w-100 py-5 my-4">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 className="empty-state-title">No Products Found</h3>
          <p className="empty-state-text">
            We couldn't find any products matching your active filters or search terms. Try adjusting your search query or clearing filter criteria.
          </p>
        </div>
      ) : (
        currentProducts.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const discountedPrice = getFormattedDiscountedPrice(product.salePrice, product.discount);
          const isInWishlist = wishlist.includes(product.id);

          return (
            <div key={product.id} className="col-lg-3 col-md-4 col-6 product-card-container mt-2">
              <div className={`product-card-custom ${isOutOfStock ? 'disabled-card' : ''}`}>
                <div className="img-wrap">
                  {/* Category Badge */}
                  <span className="badge-category">
                    {product.categoryId?.name || "Groceries"}
                  </span>
                  
                  {/* Discount Badge */}
                  {!isOutOfStock && product.discount > 0 && (
                    <span className="badge-discount">
                      -{product.discount}%
                    </span>
                  )}
                  
                  <Link to={`/product/${product.id}`} className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <img
                      src={product.productImage || PLACEHOLDER_IMAGE}
                      alt={product.productName}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </Link>

                  {/* Wishlist Heart Icon */}
                  <button
                    type="button"
                    data-testid={`wishlist-toggle-${product.id}`}
                    className={`wishlist-heart-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Toggle Wishlist"
                  >
                    <i className={`${isInWishlist ? 'fas' : 'far'} fa-heart`} />
                  </button>
                </div>

                <div className="card-content">
                  <Link className="product-title" to={`/product/${product.id}`}>
                    {product.productName}
                  </Link>

                  {/* Rating / Review count */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="rating-badge">
                      <i className="fas fa-star" />
                      {product.averageRating ? Number(product.averageRating).toFixed(1) : "0.0"}
                    </span>
                    <span className="review-count">
                      ({product.totalReviews || 0} reviews)
                    </span>
                  </div>

                  {/* Pricing row */}
                  <div className="price-row">
                    <span className="discounted-price">₹{discountedPrice}</span>
                    {product.discount > 0 && (
                      <span className="original-price">₹{product.salePrice}</span>
                    )}
                  </div>

                  {/* Add to Cart button */}
                  {isOutOfStock ? (
                    <button className="add-to-cart-btn" disabled>
                      <i className="fas fa-ban"></i> Out of Stock
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.id}`}
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCartClick(product.id)}
                      disabled={addingToCartId === product.id}
                    >
                      <i className="fas fa-shopping-basket"></i>
                      {addingToCartId === product.id ? "Adding..." : "Add to Cart"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      {totalPages > 1 && (
  <nav className="mt-4 d-flex justify-content-center">
    <ul className="pagination">
      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
      </li>

      {[...Array(totalPages)].map((_, i) => (
        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
          <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
        </li>
      ))}

      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
      </li>
    </ul>
  </nav>
)}
    </div>
  );
};

export default ProductList;
