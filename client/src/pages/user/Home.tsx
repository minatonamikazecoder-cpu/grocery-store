import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import ProductList from "../../components/user/ProductList";
const Home = () => {
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tredingProducts, setTrendingProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBanners(),
          fetchOffers(),
          fetchTrendingProducts(),
          fetchLatestProducts(),
          fetchCategories()
        ]);
      } catch (err) {
        console.error("Error loading home page data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const fetchBanners = async () => {
    const res = await api.get("/banners");
    setBanners(res.data);
  };

  const fetchOffers = async () => {
    const res = await api.get("/offers");
    setOffers(res.data.filter((offer) => offer.activeStatus));
  };

  const fetchTrendingProducts = async () => {
    const res = await api.get("/products/trending");
    setTrendingProducts(res.data);
  };
  const fetchLatestProducts = async () => {
    const res = await api.get("/products/latest");
    setLatestProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  const sliderBanners = banners.filter((b) => b.type === "slider");
  const promoBanners = banners.filter((b) => b.type !== "slider");


  return (
    <div>
      {loading ? (
        <div className="skeleton w-100" style={{ height: "450px" }} />
      ) : (
        <Carousel banners={sliderBanners} />
      )}

      {loading ? (
        <div className="categories-section">
          <div className="container">
            <div className="skeleton" style={{ height: "100px", borderRadius: "12px" }}></div>
          </div>
        </div>
      ) : (
        <Categories categories={categories} />
      )}

      {loading ? (
        <div className="container mt-5">
          <h2 className="text-center mb-4">Exclusive Offers</h2>
          <div className="row">
            {[1, 2].map((i) => (
              <div key={i} className="col-md-6 mb-4">
                <div className="card border-success shadow-sm" style={{ height: "140px", borderColor: '#DEF9EC' }}>
                  <div className="card-body d-flex flex-column align-items-center justify-content-center">
                    <div className="skeleton skeleton-text" style={{ width: "50%", height: "20px" }}></div>
                    <div className="skeleton skeleton-text" style={{ width: "70%", height: "14px", marginTop: "10px" }}></div>
                    <div className="skeleton skeleton-button" style={{ width: "100px", height: "25px", marginTop: "10px" }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ExclusiveOffers offers={offers} />
      )}

      <section className="mt-5 container">
        <div className="section-header">
          <h2 className="section-title">Trending Products</h2>
          <Link to="/shop" className="section-link">
            View all <i className="fa fa-arrow-right" />
          </Link>
        </div>
        <ProductList products={tredingProducts} loading={loading} />

        {loading ? (
          <div className="row my-5 gap-md-0 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="col-md-6 col-12">
                <div className="skeleton" style={{ height: "250px", borderRadius: "12px" }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row my-5 gap-md-0 gap-3">
            {promoBanners[0] && (
              <div className="col-md-6 col-12">
                <div className="border position-relative banner">
                  <img src={promoBanners[0].bannerImage} alt="" className="img-fluid" />
                  <div className="banner-content">
                    <p className="label">Free Shipping</p>
                    <h5 className="heading my-2">Special Deal</h5>
                    <p className="content p-0 align-self-start">
                      Shipping is free on your first order
                    </p>
                    <Link className="btn btn-primary order-link" to="/shop">
                      Shop Now <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {promoBanners[1] && (
              <div className="col-md-6 col-12">
                <div className="border position-relative banner">
                  <img src={promoBanners[1].bannerImage} alt="" className="img-fluid" />
                  <div className="banner-content">
                    <p className="label">Exclusive Offer</p>
                    <h5 className="heading my-2">Buy One Get One</h5>
                    <p className="content p-0 align-self-start">
                      Get an extra item absolutely free on selected products
                    </p>
                    <Link className="btn btn-primary order-link" to="/shop">
                      Grab Offer <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="section-header">
          <h2 className="section-title">Latest Products</h2>
          <Link to="/shop" className="section-link">
            View all <i className="fa fa-arrow-right" />
          </Link>
        </div>
        <ProductList products={latestProducts} loading={loading} />
      </section>
    </div>
  );
};

const Carousel = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div id="carouselExampleIndicators" className="carousel slide">
      <ol className="carousel-indicators">
        {banners.map((_, index) => (
          <li
            key={index}
            className={index === activeIndex ? "active" : ""}
            onClick={() => setActiveIndex(index)}
          ></li>
        ))}
      </ol>

      <div className="carousel-inner">
        {banners.map((banner, index) => (
          <div
            key={banner._id || banner.id || index}
            className={`carousel-item ${index === activeIndex ? "active" : ""}`}
          >
            <img
              className="d-block w-100"
              src={banner.bannerImage}
              alt={`Banner ${index + 1}`}
            />
            {index === 0 && (
              <div className="carousel-caption h-100 d-md-block">
                <div className="row align-items-center h-100">
                  <div className="hero-content col-md-6 text-black text-center text-md-start">
                    <span>Welcome to</span>
                    <h1 className="text-black">PureBite</h1>
                    <p>
                      Discover a world of fresh, quality groceries delivered
                      straight to your door.
                    </p>
                    <Link to="/shop" className="btn btn-primary">
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length >= 2 && (
        <>
          <button className="carousel-control-prev" onClick={handlePrev}>
            <span className="carousel-control-prev-icon" />
          </button>
          <button className="carousel-control-next" onClick={handleNext}>
            <span className="carousel-control-next-icon" />
          </button>
        </>
      )}
    </div>
  );
};

const ExclusiveOffers = ({ offers }) => (
  <div className="container mt-5">
    <div className="section-header mt-0 mb-3">
      <h2 className="section-title">Exclusive Offers</h2>
    </div>
    <div className="row">
      {offers.map((offer) => (
        <div key={offer._id} className="col-md-6 mb-4">
          <div className="card border-success shadow-sm" style={{ borderRadius: "var(--radius-md)", borderColor: "var(--primary-light) !important" }}>
            <div className="card-body text-center p-4">
              <h5 className="card-title text-success font-weight-bold" style={{ fontSize: "1.5rem" }}>{offer.discount}% Discount</h5>
              <p className="card-text text-muted my-2">On orders above ₹{offer.minimumOrder}</p>
              <p className="card-text mb-0">
                <strong className="text-dark">Use Code:</strong>{" "}
                <span className="badge" style={{ backgroundColor: "var(--primary)", padding: "8px 12px", borderRadius: "var(--radius-pill)" }}>{offer.offerCode}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Categories = ({ categories }) => (
  <section className="categories-section">
    <div className="container">
      <div className="section-header mt-0 mb-3">
        <h2 className="section-title">Shop by Category</h2>
      </div>
      <div className="categories-scroll">
        {categories.map((cat) => (
          <Link key={cat._id || cat.id} to={`/shop?category=${cat._id || cat.id}`} className="category-chip">
            <div className="category-img-wrap">
              <img src={cat.image} alt={cat.name} />
            </div>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default Home;
