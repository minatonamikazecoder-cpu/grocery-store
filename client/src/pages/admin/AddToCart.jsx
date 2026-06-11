import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddToCart = () => {
    const { userId } = useParams();
    const [products, setProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);

    const [formData, setFormData] = useState({
        productId: "",
        quantity: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;
        if (name === "productId" && !value) error = "Please select a product.";
        if (name === "quantity" && (!value || value <= 0)) error = "Quantity must be at least 1.";
        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.values(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setAddingToCart(true);
        try {
            await api.post("/cart", {
                userId,
                productId: formData.productId,
                quantity: formData.quantity,
            });
            toast.success("Product added to cart successfully!");
            setFormData({ productId: "", quantity: "" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to add product to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Product to Cart</h1>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/admin/users">Users</Link></li>
                    <li className="breadcrumb-item"><Link to={`/admin/cart/${userId}`}>Cart</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Add Product to Cart</li>
                </ol>
            </nav>
            <h5>User ID: {userId}</h5>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="productId" className="form-label">Product</label>
                                    <select
                                        className="form-select"
                                        id="productId"
                                        name="productId"
                                        value={formData.productId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((prod) => (
                                            <option key={prod._id} value={prod._id}>
                                                {prod.productName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.productId && <p className="text-danger">{errors.productId}</p>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="quantity" className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="quantity"
                                        name="quantity"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                    />
                                    {errors.quantity && <p className="text-danger">{errors.quantity}</p>}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={addingToCart}>
                            {addingToCart ? "Adding..." : "Add to Cart"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddToCart;
