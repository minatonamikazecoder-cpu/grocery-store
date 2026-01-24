import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const UpdateOrder = () => {
	const navigate = useNavigate();
	const { orderId } = useParams();
	const [formData, setFormData] = useState({
		userId: "",
		orderDate: "",
		products: [{ productId: "", quantity: 1 }],
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		state: "",
		pinCode: "",
		phone: "",
		shippingCharge: "0",
		status: "Pending",
	});

	const [errors, setErrors] = useState({
		userId: "",
		orderDate: "",
		products: [],
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		state: "",
		pinCode: "",
		phone: "",
		shippingCharge: "",
		status: "",
	});

	const [users, setUsers] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchUsers();
		fetchProducts();
		fetchOrder();
	}, [orderId]);

	const fetchUsers = async () => {
		try {
			const res = await axios.get("http://localhost:8000/users");
			setUsers(res.data);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			toast.error("Failed to load users.");
		}
	};

	const fetchProducts = async () => {
		try {
			const res = await axios.get("http://localhost:8000/products");
			setProducts(res.data);
		} catch (error) {
			console.error("Failed to fetch products:", error);
			toast.error("Failed to load products.");
		}
	};

	const fetchOrder = async () => {
		try {
			const res = await axios.get(
				`http://localhost:8000/orders/${orderId}`
			);
			const { order, orderItems } = res.data;

			setFormData({
				userId: order.userId._id,
				orderDate: order.orderDate.split("T")[0],
				firstName: order.delAddressId.fullName.split(" ")[0],
				lastName: order.delAddressId.fullName.split(" ")[1] || "",
				address: order.delAddressId.address,
				city: order.delAddressId.city,
				state: order.delAddressId.state,
				pinCode: order.delAddressId.pincode,
				phone: order.delAddressId.phone,
				shippingCharge: order.shippingCharge.$numberDecimal,
				status: order.orderStatus,
				products: orderItems.map((item) => ({
					productId: item.productId._id,
					quantity: item.quantity,
				})),
			});
			setLoading(false);
		} catch (err) {
			toast.error("Failed to fetch order");
			setLoading(false);
		}
	};

	const handleProductChange = (index, e) => {
		const { name, value } = e.target;
		const newProducts = [...formData.products];
		newProducts[index][name] = value;
		setFormData({ ...formData, products: newProducts });

		const errorMessage = validateField(name, value);
		const newErrors = { ...errors };
		if (!newErrors.products[index]) newErrors.products[index] = {};
		newErrors.products[index][name] = errorMessage || undefined;
		setErrors(newErrors);
	};

	const addProduct = () => {
		setFormData({
			...formData,
			products: [...formData.products, { productId: "", quantity: 1 }],
		});
		setErrors({
			...errors,
			products: [...errors.products, {}],
		});
	};

	const removeProduct = (index) => {
		const newProducts = formData.products.filter((_, i) => i !== index);
		setFormData({ ...formData, products: newProducts });
		setErrors((prevErrors) => {
			const newErrors = { ...prevErrors };
			newErrors.products = prevErrors.products.filter(
				(_, i) => i !== index
			);
			return newErrors;
		});
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });

		const errorMessage = validateField(name, value);
		setErrors((prevErrors) => ({
			...prevErrors,
			[name]: errorMessage || undefined,
		}));
	};

	const validateField = (name, value) => {
		if (!value || (typeof value === "string" && !value.trim())) {
			const fieldNames = {
				userId: "User ID",
				orderDate: "Order Date",
				firstName: "First Name",
				lastName: "Last Name",
				address: "Address",
				city: "City",
				state: "State",
				pinCode: "Pin Code",
				phone: "Phone Number",
				shippingCharge: "Shipping Charge",
				status: "Order Status",
				productId: "Product ID",
				quantity: "Quantity",
			};
			return `${fieldNames[name] || "This field"} is required.`;
		}
		if (name === "quantity" && (isNaN(value) || value <= 0)) {
			return "Quantity must be greater than 0.";
		}
		return undefined;
	};

	const validateForm = () => {
		const newErrors = {
			userId: "",
			orderDate: "",
			products: [],
			firstName: "",
			lastName: "",
			address: "",
			city: "",
			state: "",
			pinCode: "",
			phone: "",
			shippingCharge: "",
			status: "",
		};

		if (!formData.userId) newErrors.userId = "Please select a user.";
		if (!formData.orderDate)
			newErrors.orderDate = "Please enter an order date.";

		formData.products.forEach((product, index) => {
			newErrors.products[index] = {};
			if (!product.productId) {
				newErrors.products[index].productId = "Product ID is required.";
			}
			if (!product.quantity || product.quantity <= 0) {
				newErrors.products[index].quantity =
					"Quantity must be greater than 0.";
			}
		});

		const requiredFields = [
			"firstName",
			"lastName",
			"address",
			"city",
			"state",
			"pinCode",
			"phone",
			"shippingCharge",
		];
		requiredFields.forEach((field) => {
			if (!formData[field]) {
				newErrors[field] = `${field
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (str) => str.toUpperCase())} is required.`;
			}
		});

		setErrors(newErrors);

		const hasErrors =
			Object.entries(newErrors).some(
				([key, value]) => key !== "products" && value
			) ||
			newErrors.products.some((productErrors) =>
				Object.values(productErrors).some((error) => error)
			);

		return !hasErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (validateForm()) {
			try {
				const addressData = {
					fullName: formData.firstName + " " + formData.lastName,
					userId: formData.userId,
					address: formData.address,
					city: formData.city,
					state: formData.state,
					pincode: formData.pinCode,
					phone: formData.phone,
				};

				const addressResponse = await axios.post(
					`http://localhost:8000/addresses`,
					addressData
				);

				if (addressResponse.data._id) {
					const orderData = {
						userId: formData.userId,
						orderDate: formData.orderDate,
						orderStatus: formData.status,
						products: formData.products,
						shippingCharge: formData.shippingCharge,
						delAddressId: addressResponse.data._id,
					};

					const orderResponse = await axios.put(
						`http://localhost:8000/orders/${orderId}`,
						orderData
					);

					if (orderResponse.status === 200) {
						toast.success("Order updated successfully!");
						navigate("/admin/orders");
					} else {
						toast.error("Failed to update order.");
					}
				} else {
					toast.error("Failed to update address.");
				}
			} catch (error) {
				console.error("Error updating order:", error);
				toast.error("An error occurred while updating the order.");
			}
		}
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mt-4 mb-4">
				<div>
					<h1>Update Order</h1>
					<ol className="breadcrumb mb-0">
						<li className="breadcrumb-item">
							<Link to="/admin">Dashboard</Link>
						</li>
						<li className="breadcrumb-item">
							<Link to="/admin/orders">Orders</Link>
						</li>
						<li className="breadcrumb-item active">Update Order</li>
					</ol>
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label className="form-label">User</label>
					<select
						className="form-select"
						name="userId"
						value={formData.userId}
						onChange={handleChange}
					>
						<option value="">Select User</option>
						{users.map((user) => (
							<option key={user._id} value={user._id}>
								{user.firstName}
							</option>
						))}
					</select>
					{errors.userId && (
						<div className="error-message">{errors.userId}</div>
					)}
				</div>

				<div className="mb-3">
					<label className="form-label">Order Date</label>
					<input
						type="date"
						className="form-control"
						name="orderDate"
						value={formData.orderDate}
						onChange={handleChange}
					/>
					{errors.orderDate && (
						<div className="error-message">{errors.orderDate}</div>
					)}
				</div>

				<div id="productContainer">
					{formData.products.map((product, index) => (
						<div className="product-entry mb-3" key={index}>
							<h5>Product {index + 1}</h5>
							<div className="row align-items-end">
								<div className="col-md-5">
									<label className="form-label">
										Product
									</label>
									<select
										className="form-select"
										name="productId"
										value={product.productId}
										onChange={(e) =>
											handleProductChange(index, e)
										}
									>
										<option value="">Select Product</option>
										{products.map((prod) => (
											<option
												key={prod._id}
												value={prod._id}
											>
												{prod.productName}
											</option>
										))}
									</select>
									{errors.products[index]?.productId && (
										<div className="error-message">
											{errors.products[index].productId}
										</div>
									)}
								</div>
								<div className="col-md-5">
									<label className="form-label">
										Quantity
									</label>
									<input
										type="number"
										className="form-control"
										name="quantity"
										min="1"
										value={product.quantity}
										onChange={(e) =>
											handleProductChange(index, e)
										}
									/>
									{errors.products[index]?.quantity && (
										<div className="error-message">
											{errors.products[index].quantity}
										</div>
									)}
								</div>
								<div className="col-md-2">
									<button
										type="button"
										className="btn btn-danger mt-2"
										onClick={() => removeProduct(index)}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<button
					type="button"
					className="btn btn-secondary mb-3"
					onClick={addProduct}
				>
					Add Another Product
				</button>

				<h4>Shipping Details</h4>
				<div className="row">
					<div className="col-md-6 mb-3">
						<label className="form-label">First Name</label>
						<input
							type="text"
							name="firstName"
							className="form-control"
							value={formData.firstName}
							onChange={handleChange}
						/>
						{errors.firstName && (
							<div className="error-message">
								{errors.firstName}
							</div>
						)}
					</div>
					<div className="col-md-6 mb-3">
						<label className="form-label">Last Name</label>
						<input
							type="text"
							name="lastName"
							className="form-control"
							value={formData.lastName}
							onChange={handleChange}
						/>
						{errors.lastName && (
							<div className="error-message">
								{errors.lastName}
							</div>
						)}
					</div>
					<div className="col-12 mb-3">
						<label className="form-label">Address</label>
						<textarea
							name="address"
							className="form-control"
							rows="2"
							value={formData.address}
							onChange={handleChange}
						></textarea>
						{errors.address && (
							<div className="error-message">
								{errors.address}
							</div>
						)}
					</div>
					<div className="col-md-4 mb-3">
						<label className="form-label">City</label>
						<input
							type="text"
							name="city"
							className="form-control"
							value={formData.city}
							onChange={handleChange}
						/>
						{errors.city && (
							<div className="error-message">{errors.city}</div>
						)}
					</div>
					<div className="col-md-4 mb-3">
						<label className="form-label">State</label>
						<input
							type="text"
							name="state"
							className="form-control"
							value={formData.state}
							onChange={handleChange}
						/>
						{errors.state && (
							<div className="error-message">{errors.state}</div>
						)}
					</div>
					<div className="col-md-4 mb-3">
						<label className="form-label">Pin Code</label>
						<input
							type="text"
							name="pinCode"
							className="form-control"
							value={formData.pinCode}
							onChange={handleChange}
						/>
						{errors.pinCode && (
							<div className="error-message">
								{errors.pinCode}
							</div>
						)}
					</div>
					<div className="col-md-6 mb-3">
						<label className="form-label">Phone</label>
						<input
							type="text"
							name="phone"
							className="form-control"
							value={formData.phone}
							onChange={handleChange}
						/>
						{errors.phone && (
							<div className="error-message">{errors.phone}</div>
						)}
					</div>
					<div className="col-md-6 mb-3">
						<label className="form-label">Shipping Charge</label>
						<input
							type="number"
							name="shippingCharge"
							className="form-control"
							value={formData.shippingCharge}
							onChange={handleChange}
						/>
						{errors.shippingCharge && (
							<div className="error-message">
								{errors.shippingCharge}
							</div>
						)}
					</div>
				</div>

				<div className="mb-3">
					<label className="form-label">Order Status</label>
					<select
						name="status"
						className="form-select"
						value={formData.status}
						onChange={handleChange}
					>
						<option value="Pending">Pending</option>
						<option value="Processing">Processing</option>
						<option value="Shipped">Shipped</option>
						<option value="Delivered">Delivered</option>
						<option value="Cancelled">Cancelled</option>
					</select>
					{errors.status && (
						<div className="error-message">{errors.status}</div>
					)}
				</div>

				<button type="submit" className="btn btn-primary">
					Update Order
				</button>
			</form>
		</div>
	);
};

export default UpdateOrder;
