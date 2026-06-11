import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddCategory = () => {
    const [formData, setFormData] = useState({
        categoryName: "",
        color: "#000000", // default to black
        image: null,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate field
        const error = validateField(name, value);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });

        // Validate file
        const error = validateField(name, files[0]);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;

        if (name === "categoryName") {
            if (!value.trim()) {
                error = "Category name is required.";
            } else if (value.length < 3) {
                error = "Category name must be at least 3 characters.";
            } else if (value.length > 50) {
                error = "Category name cannot exceed 50 characters.";
            }
        }

        if (name === "color") {
            if (!value.trim()) {
                error = "Color is required.";
            }
        }

        if (name === "image") {
            if (!value) {
                error = "Image is required.";
            }
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

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        
        // Set loading to true while the request is in progress
        setLoading(true);

        // Prepare data to be sent to the backend
        const categoryData = new FormData();
        categoryData.append("name", formData.categoryName);
        categoryData.append("color", formData.color);
        categoryData.append("image", formData.image);

        try {
            const response = await api.post(
                "/categories", 
                categoryData, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // for file upload
                    },
                }
            );
            toast.success("Category added successfully");
            navigate("/admin/categories"); // Redirect to categories page after successful creation
        } catch (error) {
            toast.error("Failed to add category");
            console.error("Error adding category:", error);
        }

        // Set loading to false when the request finishes
        setLoading(false);
    };

    return (
        <div>
       
            <h1 className="mt-4">Add Category</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">
                    <Link to="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                    <Link to="/admin/categories">Categories</Link>
                </li>
                <li className="breadcrumb-item active">Add Category</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="categoryName" className="form-label">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="categoryName"
                                        name="categoryName"
                                        value={formData.categoryName}
                                        onChange={handleChange}
                                    />
                                    {errors.categoryName && <div className="text-danger">{errors.categoryName}</div>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="color" className="form-label">
                                        Color
                                    </label>
                                    <input
                                        type="color"
                                        className="form-control"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                    />
                                    {errors.color && <div className="text-danger">{errors.color}</div>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="image" className="form-label">
                                        Category Image
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="image"
                                        name="image"
                                        onChange={handleFileChange}
                                    />
                                    {errors.image && <div className="text-danger">{errors.image}</div>}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Adding..." : "Add Category"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;
