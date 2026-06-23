import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";

const UpdateProduct = () => {
    const { id } = useParams();
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

    const [oldImageUrl, setOldImageUrl] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                const product = res.data;

                setFormData({
                    productName: product.productName || "",
                    productDiscount: product.discount || "",
                    costPrice: product.costPrice || "",
                    salePrice: product.salePrice || "",
                    productStock: product.stock || "",
                    productCategory: product.categoryId?._id || "",
                    productDescription: product.description || "",
                    productImage: null,
                });

                setOldImageUrl(product.productImage ? product.productImage : null); // If it's a filename, update this to full URL
            } catch (error) {
                console.error("Error loading product:", error);
                toast.error("Failed to load product");
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        fetchProduct();
        fetchCategories();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value, type, files } = e.target;
        const newValue = type === "file" ? files[0] : value;
        setFormData({ ...formData, [name]: newValue });

        const error = validateField(name, newValue);
        setErrors((prevErrors: any) => ({ ...prevErrors, [name]: error }));

       
    };

    const validateField = (name: string, value: any) => {
        let error: string | null = null;
        const formattedName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        if (!value && typeof value === "string") {
            return `${formattedName} is required.`;
        }

        if (name === "productName") {
            if (/^\d+$/.test(value)) return "Product name cannot be a number.";
            if (value.length < 3) return "Product name must be at least 3 characters.";
        }

        if (["productDiscount", "costPrice", "salePrice", "productStock"].includes(name)) {
            if (isNaN(value) || value < 0) return `${formattedName} must be a valid non-negative number.`;
        }

        if (name === "productDiscount" && (value < 1 || value > 100)) {
            return "Discount must be between 1% and 100%.";
        }

        if (name === "salePrice" && parseFloat(value) < parseFloat(formData.costPrice)) {
            return "Sale price cannot be less than cost price.";
        }

        if (name === "productStock" && !Number.isInteger(Number(value))) {
            return "Stock quantity must be a whole number.";
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (name === "productImage" && value && !allowedTypes.includes(value.type)) {
            return "Only JPG, PNG, and GIF formats are allowed.";
        }

        return error;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, (formData as any)[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const updateData = new FormData();
            updateData.append("productName", formData.productName);
            updateData.append("discount", formData.productDiscount);
            updateData.append("costPrice", formData.costPrice);
            updateData.append("salePrice", formData.salePrice);
            updateData.append("stock", formData.productStock);
            updateData.append("categoryId", formData.productCategory);
            updateData.append("description", formData.productDescription);
            if (formData.productImage) {
                updateData.append("productImage", formData.productImage);
            }

            await api.put(`/products/${id}`, updateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Product updated successfully!");
            navigate("/admin/products");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update product");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="mt-4">Update Product</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/products">Products</Link></li>
                <li className="breadcrumb-item active">Update Product</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Product Name</label>
                                <input type="text" className="form-control" name="productName" value={formData.productName} onChange={handleChange} />
                                {errors.productName && <small className="text-danger">{errors.productName}</small>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Discount (%)</label>
                                <input type="number" className="form-control" name="productDiscount" value={formData.productDiscount} onChange={handleChange} />
                                {errors.productDiscount && <small className="text-danger">{errors.productDiscount}</small>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Cost Price</label>
                                <input type="number" className="form-control" name="costPrice" value={formData.costPrice} onChange={handleChange} />
                                {errors.costPrice && <small className="text-danger">{errors.costPrice}</small>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Sale Price</label>
                                <input type="number" className="form-control" name="salePrice" value={formData.salePrice} onChange={handleChange} />
                                {errors.salePrice && <small className="text-danger">{errors.salePrice}</small>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Stock Quantity</label>
                                <input type="number" className="form-control" name="productStock" value={formData.productStock} onChange={handleChange} />
                                {errors.productStock && <small className="text-danger">{errors.productStock}</small>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category</label>
                                <select className="form-select" name="productCategory" value={formData.productCategory} onChange={handleChange}>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.productCategory && <small className="text-danger">{errors.productCategory}</small>}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="productDescription" value={formData.productDescription} onChange={handleChange} rows={4}></textarea>
                            {errors.productDescription && <small className="text-danger">{errors.productDescription}</small>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Product Image</label>
                            <input type="file" className="form-control" name="productImage" onChange={handleChange} />
                            {errors.productImage && <div className="text-danger">{errors.productImage}</div>}

                            {oldImageUrl ? (
                                <div className="mt-2">
                                    <small>Current Image:</small><br />
                                    <img
                                        src={oldImageUrl || PLACEHOLDER_IMAGE}
                                        alt="Current"
                                        height="150px"
                                        onError={(e) => {
                                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Product"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateProduct;
