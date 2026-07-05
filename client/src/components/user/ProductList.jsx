import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const ProductList = ({ products }) => {
  const { user, updateCartCount, updateWishlistCount } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 8;

const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

const totalPages = Math.ceil(products.length / productsPerPage);

const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      setLoadingWishlist(true);
      try {
        const response = await api.get(`/wishlist/${user._id}`);
        const productIds = response.data.wishlist?.productIds.map(p => p._id);
        setWishlist(productIds || []);
      } catch (error) {
        // toast.error("Failed to fetch wishlist.");
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error("Please log in to use wishlist.");
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${user._id}/remove`, {
          data: { productId },
        });
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.info("Product removed from wishlist.");
      } else {
        const res = await api.post(`/wishlist/${user._id}/add`, {
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

  const handleAddToCartClick = async (productId) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    setAddingToCartId(productId);
    try {
      const response = await api.post(`/cart`, {
        userId: user._id,
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

  return (
    <div className="row justify-content-start align-items-stretch">
      {!currentProducts || currentProducts.length === 0 ? (
        <p className="text-center">No products found</p>
      ) : (
        currentProducts.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const discountedPrice = (product.salePrice - (product.salePrice * product.discount) / 100).toFixed(2);
          const isInWishlist = wishlist.includes(product._id);

          return (
            <div key={product._id} className="col-lg-3 col-md-4 col-6 gap p-2 mt-2">
              <div className={`card h-100 ${isOutOfStock ? 'disabled-card' : ''}`}>
                <div className="product-image text-center position-relative">
                  <Link to={`/product/${product._id}`}>
                    <img
                      className="img-thumbnail img-fluid p-4"
                      style={{ height: "225px" }}
                      src={product.productImage || "/img/placeholder.jpg"}
                      alt={product.productName}
                      onError={(e) => { e.target.onerror = null; e.target.src = "/img/placeholder.jpg"; }}
                    />
                  </Link>
                    <p
                    data-testid={`wishlist-toggle-${product._id}`}
                    className="like text-decoration-none position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill"
                    style={{
                      cursor: "pointer",
                      backgroundColor: isInWishlist ? "var(--dark-primary)" : "var(--primary)",
                      color: "#fff",
                    }}
                    onClick={() => toggleWishlist(product._id)}
                  >
                    <i className={`fa${isInWishlist ? "s" : "r"} fa-heart`}></i>
                  </p>

                  <div className="label">
                    {isOutOfStock ? "Out Of Stock" : `Save ${product.discount}%`}
                  </div>
                </div>

                <div className="card-body product-body px-3">
                  <div className="d-flex flex-col gap-0 align-items-sm-start align-items-center">
                    <Link className="category-name category-link" to="/shop">
                      {product.categoryId?.name || "Category"}
                    </Link>
                    <Link
                      className="card-title category-link font-black"
                      to={`/product/${product._id}`}
                    >
                      <h6 className="not-link text-decoration-none mb-0">
                        {product.productName}
                      </h6>
                    </Link>
                    <div className="rating-section mb-sm-0 mb-2">
                      <div className="ratings">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`fa fa-star ${product.averageRating > i ? "checked" : ""}`}
                          ></span>
                        ))}
                      </div>
                      <div className="review-count ps-1">
                        ({product.totalReviews || 0})
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-sm-row flex-column justify-content-sm-between justify-content-center align-items-sm-end mt-sm-2 align-items-center gap-sm-0 gap-2">
                    <div>
                      <span className="price">₹{discountedPrice}</span>
                      <span className="striked-price">₹{product.salePrice}</span>
                    </div>
                    {isOutOfStock ? (
                      <button className="primary-btn order-link mt-sm-1" disabled>
                        <i className="fa-solid fa-cart-shopping pe-2"></i>Add
                      </button>
                    ) : (
                      <button
                        data-testid={`add-to-cart-${product._id}`}
                        className="primary-btn order-link mt-sm-1"
                        onClick={() => handleAddToCartClick(product._id)}
                        disabled={addingToCartId === product._id}
                      >
                        <i className="fa-solid fa-cart-shopping pe-2"></i>
                        {addingToCartId === product._id ? "Adding..." : "Add"}
                      </button>
                    )}
                  </div>
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
