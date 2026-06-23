import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import DOMPurify from "dompurify";
import Skeleton from "../../components/user/Skeleton";

const About = () => {
  const [content, setContent] = useState(""); // State to store the fetched content
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors

  // Fetch the about page content when the component mounts
  useEffect(() => {
    const fetchAboutPage = async () => {
      try {
        const response = await api.get("/about-page");
        if (response.data && response.data.data) {
          setContent(response.data.data.content); // Set content from the API response
        }
        setLoading(false); // Set loading to false once the data is fetched
      } catch (err) {
        setError("Failed to load about page content.");
        setLoading(false); // Set loading to false even if there is an error
      }
    };

    fetchAboutPage(); // Call the function to fetch data
  }, []); // Empty dependency array to run once when the component mounts

  if (loading) {
    return (
      <div className="container sitemap mt-5">
        <div className="my-5">
          <Skeleton width="15%" height="20px" />
        </div>
        <div className="about row justify-content-center">
          <div className="col-lg-12">
            <Skeleton width="30%" height="36px" style={{ marginBottom: "30px" }} />
            <Skeleton width="100%" height="18px" style={{ marginBottom: "15px" }} />
            <Skeleton width="95%" height="18px" style={{ marginBottom: "15px" }} />
            <Skeleton width="98%" height="18px" style={{ marginBottom: "15px" }} />
            <Skeleton width="60%" height="18px" style={{ marginBottom: "40px" }} />
            
            <Skeleton width="25%" height="28px" style={{ marginBottom: "20px" }} />
            <Skeleton width="97%" height="16px" style={{ marginBottom: "15px" }} />
            <Skeleton width="93%" height="16px" style={{ marginBottom: "15px" }} />
            <Skeleton width="40%" height="16px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>; // Display error message if something goes wrong
  }

  return (
    <div className="container about-us-container mt-5">
      <p className="mb-4">
        <Link to="/" className="text-decoration-none dim link">
          Home /
        </Link>{" "}
        About
      </p>

      {/* Hero / Our Story Section */}
      <section className="about-hero-section row align-items-center mb-5">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <h2 className="about-section-title left-aligned mb-4">Our Story</h2>
          {content && content.trim() !== "" ? (
            <div
              className="about-content about-hero-text"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          ) : (
            <div className="about-hero-text">
              <p className="mb-3">
                Welcome to <strong>PureBite Grocery</strong>, your premier destination for farm-fresh, premium quality organic groceries. Founded with a simple yet passionate mission, we strive to bring the healthiest, cleanest, and most delicious produce and grocery essentials straight to your doorstep.
              </p>
              <p className="mb-3">
                We partner directly with certified local farmers and premium sustainable vendors to ensure that every single item we deliver meets the highest standards of safety, quality, and flavor. At PureBite, we believe that good health begins with clean, nutrient-dense food, and we are dedicated to helping our community live happier, healthier lives without compromising on convenience.
              </p>
              <p>
                From organic heirloom tomatoes to fresh whole-grain sourdough bread, we curate our inventory with care so you can feed your family with total peace of mind.
              </p>
            </div>
          )}
        </div>
        <div className="col-lg-6 text-center">
          <div className="about-hero-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
              alt="Fresh Organic Grocery Store"
              className="img-fluid w-100"
              style={{ objectFit: "cover", maxHeight: "400px" }}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800";
              }}
            />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values-section text-center mb-5">
        <div className="container py-4">
          <h2 className="about-section-title mb-5">Our Core Values</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-6 col-lg-3">
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <i className="fas fa-apple-alt"></i>
                </div>
                <h5>Freshness & Quality</h5>
                <p>Handpicked organic produce delivered at the peak of freshness, ensuring maximum nutrition and taste.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <i className="fas fa-leaf"></i>
                </div>
                <h5>Sustainability</h5>
                <p>Supporting local farms, utilizing eco-conscious sourcing, and minimizing plastic packing materials.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <h5>Fast Delivery</h5>
                <p>Prompt, temperature-controlled delivery directly to your doorstep, keeping your items fresh and cold.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="value-card">
                <div className="value-icon-wrapper">
                  <i className="fas fa-headset"></i>
                </div>
                <h5>Customer Care</h5>
                <p>Exceptional and friendly customer service with a 100% satisfaction guarantee or hassle-free refund.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="about-how-it-works mb-5">
        <h2 className="about-section-title d-block text-center mb-5">How We Work</h2>
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="step-card card text-center shadow-sm">
              <div className="step-number">1</div>
              <div className="p-3">
                <div className="value-icon-wrapper mb-3" style={{ background: "rgba(59, 183, 126, 0.08)" }}>
                  <i className="fas fa-tractor" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <h5>Sourced From Farmers</h5>
                <p>We source daily from trusted local growers and sustainable farms to select only the finest produce.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="step-card card text-center shadow-sm">
              <div className="step-number">2</div>
              <div className="p-3">
                <div className="value-icon-wrapper mb-3" style={{ background: "rgba(59, 183, 126, 0.08)" }}>
                  <i className="fas fa-clipboard-check" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <h5>Quality Clean & Sort</h5>
                <p>Every single item undergoes strict hygienic wash, sorting, and organic food safety inspection.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="step-card card text-center shadow-sm">
              <div className="step-number">3</div>
              <div className="p-3">
                <div className="value-icon-wrapper mb-3" style={{ background: "rgba(59, 183, 126, 0.08)" }}>
                  <i className="fas fa-box" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <h5>Hygienic Fast Delivery</h5>
                <p>Your orders are carefully packed in temperature-sensitive bags and delivered directly to your door.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
