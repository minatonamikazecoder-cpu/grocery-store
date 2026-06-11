import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productName: "",
        productDiscount: "",
        costPrice: "",
        salePrice: "",
        productStock: "",
        productCategory: "",
        productDescription: "",
        productImage: null,
    });

    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        // Fetch categories from backend
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (err) {
                toast.error("Failed to load categories.");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        const newValue = type === "file" ? files[0] : value;
        setFormData({ ...formData, [name]: newValue });

        const error = validateField(name, newValue);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;
        const label = name.replace(/([A-Z])/g, ' $1').trim();

        if (!value || (typeof value === "string" && value.trim() === "")) {
            return `${label} is required.`;
        }

        if (name === "productName") {
            if (/^\d+$/.test(value)) return "Product name cannot be a number.";
            if (value.length < 3) return "Product name must be at least 3 characters.";
        }

        if (["productDiscount", "costPrice", "salePrice", "productStock"].includes(name)) {
            if (isNaN(value) || value < 0) return `${label} must be a valid non-negative number.`;
        }

        if (name === "productDiscount" && (value < 1 || value > 100)) {
            return "Discount must be between 1% and 100%.";
        }

        if (name === "salePrice" && formData.costPrice) {
            if (parseFloat(value) < parseFloat(formData.costPrice)) {
                return "Sale price cannot be less than cost price.";
            }
        }

        if (name === "productStock" && !Number.isInteger(Number(value))) {
            return "Stock quantity must be a whole number.";
        }

        if (name === "productImage") {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedTypes.includes(value.type)) {
                return "Only JPG, PNG, and GIF formats are allowed.";
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
        setLoading(true);
        try {
            const data = new FormData();
            data.append("productName", formData.productName);
            data.append("description", formData.productDescription);
            data.append("discount", formData.productDiscount);
            data.append("costPrice", formData.costPrice);
            data.append("salePrice", formData.salePrice);
            data.append("stock", formData.productStock);
            data.append("categoryId", formData.productCategory);
            data.append("productImage", formData.productImage);

            await api.post("/products", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (err) {
            console.error("Product submit error:", err);
            toast.error("Failed to add product.");
        }
    };

    return (
        <div>
            <h1 className="mt-4">Add Product</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/products">Products</Link></li>
                <li className="breadcrumb-item active">Add Product</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Form inputs here */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Product Name</label>
                                <input type="text" className="form-control" name="productName" value={formData.productName} onChange={handleChange} />
                                {errors.productName && <p className="text-danger">{errors.productName}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Discount (%)</label>
                                <input type="number" className="form-control" name="productDiscount" value={formData.productDiscount} onChange={handleChange} />
                                {errors.productDiscount && <p className="text-danger">{errors.productDiscount}</p>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Cost Price</label>
                                <input type="number" className="form-control" name="costPrice" value={formData.costPrice} onChange={handleChange} />
                                {errors.costPrice && <p className="text-danger">{errors.costPrice}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Sale Price</label>
                                <input type="number" className="form-control" name="salePrice" value={formData.salePrice} onChange={handleChange} />
                                {errors.salePrice && <p className="text-danger">{errors.salePrice}</p>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Stock Quantity</label>
                                <input type="number" className="form-control" name="productStock" value={formData.productStock} onChange={handleChange} />
                                {errors.productStock && <p className="text-danger">{errors.productStock}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category</label>
                                <select className="form-select" name="productCategory" value={formData.productCategory} onChange={handleChange}>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.productCategory && <p className="text-danger">{errors.productCategory}</p>}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="productDescription" value={formData.productDescription} onChange={handleChange} rows="4"></textarea>
                            {errors.productDescription && <p className="text-danger">{errors.productDescription}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Product Image</label>
                            <input type="file" className="form-control" name="productImage" onChange={handleChange} />
                            {errors.productImage && <p className="text-danger">{errors.productImage}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading?"true":""}>
                        {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Adding...
                                </>
                            ) : (
                                "Add Product"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
