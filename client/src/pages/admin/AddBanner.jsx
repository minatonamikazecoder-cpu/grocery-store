import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";  // You will use axios to make the API call

const AddBanner = () => {
    const [formData, setFormData] = useState({
        bannerImage: null,
        bannerOrder: "",
        bannerStatus: "1",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);  // Loading state to disable button and show loading spinner

    const navigate = useNavigate();  // Initialize navigate function

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        const newValue = type === "file" ? files[0] : value;
        setFormData({ ...formData, [name]: newValue });

        // Validate field
        const error = validateField(name, newValue);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;

        if (name === "bannerImage") {
            if (!value) {
                error = "Banner image is required.";
            } else if (!["image/jpeg", "image/png", "image/jpg"].includes(value.type)) {
                error = "Only JPG, JPEG, and PNG images are allowed.";
            }
        }

        if (name === "bannerOrder") {
            if (!value.trim()) {
                error = "View order is required.";
            } else if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
                error = "View order must be a positive number.";
            }
        }

        if (name === "bannerStatus" && value === "") {
            error = "Status is required.";
        }

        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formErrors = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) formErrors[field] = error;
        });
    
        if (Object.values(formErrors).some((error) => error)) {
            setErrors(formErrors);
            return;
        }
    
        setErrors({});
        setLoading(true);  // Set loading to true while the request is being processed
    
        const formDataToSubmit = new FormData();
        formDataToSubmit.append("bannerImage", formData.bannerImage);  // Ensure it's correct field name
        formDataToSubmit.append("viewOrder", formData.bannerOrder);  // Correct the field name here
        formDataToSubmit.append("activeStatus", formData.bannerStatus);  // Correct the field name here
        formDataToSubmit.append("type", "slider");  
    
        try {
            await api.post("/banners", formDataToSubmit, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Banner added successfully!");
            navigate("/admin/banners"); 
            // Reset form data on successful submission
            setFormData({
                bannerImage: null,
                bannerOrder: "",
                bannerStatus: "1",
            });
        } catch (error) {
            console.error("Error adding banner:", error);
            toast.error("Failed to add banner. Please try again.");
        } finally {
            setLoading(false);  // Set loading to false after the request is complete
        }
    };
    

    return (
        <div>
            <h1 className="mt-4">Add Banner</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">
                    <Link to="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                    <Link to="/admin/banners">Banners</Link>
                </li>
                <li className="breadcrumb-item active">Add Banner</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="bannerImage" className="form-label">Banner Image</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="bannerImage" 
                                        name="bannerImage" 
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleChange} 
                                    />
                                    {errors.bannerImage && <p className="text-danger">{errors.bannerImage}</p>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="bannerOrder" className="form-label">View Order</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        id="bannerOrder" 
                                        name="bannerOrder" 
                                        value={formData.bannerOrder} 
                                        onChange={handleChange} 
                                    />
                                    {errors.bannerOrder && <p className="text-danger">{errors.bannerOrder}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="bannerStatus" className="form-label">Status</label>
                            <select 
                                className="form-select" 
                                id="bannerStatus" 
                                name="bannerStatus"
                                value={formData.bannerStatus}
                                onChange={handleChange}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            {errors.bannerStatus && <p className="text-danger">{errors.bannerStatus}</p>}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}  // Disable the button while loading
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                "Add Banner"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBanner;
