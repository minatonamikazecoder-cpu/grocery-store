import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

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
    return <div>Loading...</div>; // Display loading message while content is being fetched
  }

  if (error) {
    return <div>{error}</div>; // Display error message if something goes wrong
  }

  return (
    <div className="container sitemap mt-5">
      <p>
        <Link to="/" className="text-decoration-none dim link">
          Home /
        </Link>{" "}
        About
      </p>
      <div className="about row justify-content-center">
        <div className="col-lg-12">
          <h2 className="mb-4">About Us</h2>
          {/* Render the dynamic content here */}
          <div
            className="about-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
