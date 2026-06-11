import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ProductList from "../../components/user/ProductList";

export default function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    ratings: "",
    priceRange: "",
    discount: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleWishlistClick = () => {
    toast.success("Added to wishlist");
  };

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <div className="row align-items-center sitemap">
        <div className="col-6">
          <p className="mt-5">
            <Link to="/" className="text-decoration-none dim link">Home</Link>
            <span className="text-decoration-none dim link"> / Search</span>
          </p>
        </div>
        <div className="col-6 justify-content-end d-flex">
          <button
            className="primary-btn"
            onClick={() => setFilterVisible(!filterVisible)}
          >
            <i className="fa-solid fa-filter pe-2"></i>Filter
          </button>
        </div>
      </div>

      {/* Search Query Heading */}
      <h2 className="mt-3">You searched for "<span className="text-primary">{query}</span>"</h2>

      {/* Filters Section */}
      {filterVisible && (
        <form onSubmit={handleSubmit} method="post">
          <div className="border p-3 row" id="filter-section">
            {/* Customer Ratings Section */}
            <div className="col-6 col-sm-4 col-md-3 mb-2">
              <h6 className="mb-2"><span>Customer Ratings</span></h6>
              {[4, 3, 2, 1].map((rating) => (
                <div className="text-nowrap" key={rating}>
                  <input
                    className="me-1"
                    type="radio"
                    name="ratings"
                    id={`${rating}star`}
                    value={rating}
                    checked={filters.ratings === String(rating)}
                    onChange={handleChange}
                  />
                  <label htmlFor={`${rating}star`}>
                    {rating} <i className="fa fa-star" aria-hidden="true"></i> and above
                  </label>
                </div>
              ))}
            </div>

            {/* Price Section */}
            <div className="col-6 col-sm-4 col-md-3 mb-2">
              <h6 className="mb-2"><span>Price</span></h6>
              {["lt50", "51to100", "101to200", "201to500", "gt500"].map((price) => (
                <div className="text-nowrap" key={price}>
                  <input
                    className="me-1"
                    type="radio"
                    name="priceRange"
                    id={price}
                    value={price}
                    checked={filters.priceRange === price}
                    onChange={handleChange}
                  />
                  <label htmlFor={price}>
                    {price === "lt50" ? "Less than Rs 50" :
                      price === "51to100" ? "Rs 51 to 100" :
                        price === "101to200" ? "Rs 101 to 200" :
                          price === "201to500" ? "Rs 201 to 500" : "More than Rs 500"}
                  </label>
                </div>
              ))}
            </div>

            {/* Discount Section */}
            <div className="col-6 col-sm-4 col-md-3 mb-2">
              <h6 className="mb-2"><span>Discount</span></h6>
              {["lt5", "5to15", "15to25", "gt25"].map((discount) => (
                <div className="text-nowrap" key={discount}>
                  <input
                    className="me-1"
                    type="radio"
                    name="discount"
                    id={discount}
                    value={discount}
                    checked={filters.discount === discount}
                    onChange={handleChange}
                  />
                  <label htmlFor={discount}>
                    {discount === "lt5" ? "Less than 5%" :
                      discount === "5to15" ? "5% to 15%" :
                        discount === "15to25" ? "15% to 25%" : "More than 25%"}
                  </label>
                </div>
              ))}
            </div>

            <div className="col-6 col-sm-4 col-md-3 mb-2 d-flex align-items-end justify-content-end">
              <input type="submit" value="Apply" name="filter-submit" className="primary-btn js-filter-btn" />
            </div>
          </div>
        </form>
      )}

      {/* Product List */}
      <ProductList />
    </div>
  );
}
