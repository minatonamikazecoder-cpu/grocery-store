import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const UpdateCategory = () => {
    const { id } = useParams(); // Get the category ID from URL
    const navigate = useNavigate(); // Used for redirecting after successful update

    const [formData, setFormData] = useState({
        categoryName: "",
        color: "#000000", // Default color (black)
        image: null, // For image file
    });
    const [oldImage, setOldImage] = useState(""); // To store the old image URL
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Fetch category details when component mounts or when ID changes
    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/categories/${id}`);
                setFormData({
                    categoryName: response.data.name,
                    color: response.data.color,
                    image: response.data.image,
                });
                setOldImage(response.data.image); // Store the old image URL
            } catch (error) {
                console.error("Error fetching category:", error);
                toast.error("Failed to fetch category details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate field
        const error = validateField(name, value);
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
            // Validate file
            const error = validateField(name, files[0]);
            setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateField = (name: string, value: any) => {
        let error: string | null = null;
        if (name === "categoryName") {
            if (!value || !value.trim()) {
                error = "Category name is required.";
            } else if (value.length < 3) {
                error = "Category name must be at least 3 characters.";
            } else if (value.length > 50) {
                error = "Category name cannot exceed 50 characters.";
            }
        }
        if (name === "color" && (!value || !value.trim())) {
            error = "Color is required.";
        }
        if (name === "image" && !value) {
            error = "Image is required.";
        }
        return error;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors: Record<string, string> = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, (formData as any)[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        // Prepare form data for backend
        const updatedCategory = new FormData();
        updatedCategory.append("name", formData.categoryName);
        updatedCategory.append("color", formData.color);
        if (formData.image) {
            updatedCategory.append("image", formData.image);
        }

        try {
            await api.put(`/categories/${id}`, updatedCategory, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Category updated successfully!");
            navigate("/admin/categories"); // Redirect after success
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Failed to update category.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="mt-4">Update Category</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">
                    <Link to="/admin">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                    <Link to="/admin/categories">Categories</Link>
                </li>
                <li className="breadcrumb-item active">Update Category</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                                        Category Color
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
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {errors.image && <div className="text-danger">{errors.image}</div>}
                                    {/* Display the old image if available */}
                                    {oldImage && (
                                        <div className="mt-2">
                                            <img src={oldImage} alt="Old Category" style={{ maxWidth: "150px" }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Updating..." : "Update Category"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateCategory;
