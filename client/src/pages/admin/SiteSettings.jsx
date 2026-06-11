import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";

const SiteSettings = () => {
  // State for "About Page Content"
  const [aboutContent, setAboutContent] = useState("");
  const [aboutErrors, setAboutErrors] = useState({});
  
  // State for "Contact Info"
  const [contactEmail, setContactEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactErrors, setContactErrors] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAboutPage();
    fetchContactPage();
  }, []);

  const fetchAboutPage = async () => {
    try {
      const response = await api.get("/about-page");
      const data = response.data;

      if (data && data.data.content) {
        setAboutContent(data.data.content);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchContactPage = async () => {
    try {
      const response = await api.get("/contact");
      const data = response.data;
      if (data) {
        setContactEmail(data.contactEmail || "");
        setContactNumber(data.contactNumber || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Validation for About Page Content
  const validateAboutContent = (value) => {
    let error = "";
    if (!value.trim()) {
      error = "About page content cannot be empty!";
    }
    setAboutErrors((prevErrors) => ({ ...prevErrors, aboutContent: error }));
    return error === "";
  };

  // Validation for Contact Info
  const validateContactInfo = (field, value) => {
    let error = "";
    if (field === "contactEmail") {
      if (!value.trim()) {
        error = "Email is required!";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Invalid email format!";
      }
    } else if (field === "contactNumber") {
      if (!value.trim()) {
        error = "Contact number is required!";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Contact number must be 10 digits!";
      }
    }
    setContactErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    return error === "";
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    if (validateAboutContent(aboutContent)) {
      setIsLoading(true);
      try {
        await api.put("/about-page", { content: aboutContent });
        Swal.fire("Success", "About page content updated successfully!", "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = validateContactInfo("contactEmail", contactEmail);
    const isNumberValid = validateContactInfo("contactNumber", contactNumber);

    if (isEmailValid && isNumberValid) {
      setIsLoading(true);
      try {
        await api.put("/contact", { contactEmail, contactNumber });
        Swal.fire("Success", "Contact info updated successfully!", "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <div>
          <h1>Site Settings</h1>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Site Settings</li>
          </ol>
        </div>
      </div>

      {/* About Page Content Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>Update About Page Content</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleAboutSubmit}>
            <div className="mb-3">
              <label className="form-label">About Page Content</label>
              <textarea
                className="form-control"
                rows="5"
                value={aboutContent}
                onChange={(e) => {
                  setAboutContent(e.target.value);
                  validateAboutContent(e.target.value);
                }}
              />
              {aboutErrors.aboutContent && <small className="text-danger">{aboutErrors.aboutContent}</small>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update About Page"}
            </button>
          </form>
        </div>
      </div>

      {/* Contact Info Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>Update Contact Page Info</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleContactSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Contact Email</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    validateContactInfo("contactEmail", e.target.value);
                  }}
                />
                {contactErrors.contactEmail && <small className="text-danger">{contactErrors.contactEmail}</small>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Contact Number</label>
                <input
                  type="number"
                  className="form-control"
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    validateContactInfo("contactNumber", e.target.value);
                  }}
                />
                {contactErrors.contactNumber && <small className="text-danger">{contactErrors.contactNumber}</small>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Contact Info"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
